// @vitest-environment node
import {beforeAll,afterAll,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {initialState} from '../lib/domain';
import {applyCommand} from '../lib/progression';
const db=new PGlite();
const alice='00000000-0000-4000-8000-000000000001',bob='00000000-0000-4000-8000-000000000002';
beforeAll(async()=>{
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as 'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid'; grant usage on schema auth,public to anon,authenticated,service_role; grant execute on function auth.uid() to authenticated; insert into auth.users values('${alice}'),('${bob}');`);
 const migration=readFileSync('supabase/migrations/001_gamify_life.sql','utf8').replace('create extension if not exists pgcrypto;','');
 await db.exec(migration);await db.exec(readFileSync('supabase/migrations/002_retro_rewards.sql','utf8'));await db.exec(readFileSync('supabase/seed.sql','utf8'));
},60000);
afterAll(async()=>{await db.close();});
it('seeds all canonical UUID-backed content and edges',async()=>{const {rows}=await db.query<{count:number}>('select count(*)::int as count from public.skill_nodes');expect(rows[0].count).toBe(72);});
it('commits completion, reward projections and cosmetics atomically with revision protection',async()=>{
 const s=initialState();await db.query('select public.commit_progress($1,0,$2::jsonb)',[alice,JSON.stringify(s)]);
 const next=applyCommand(s,{type:'complete',nodeId:'ten-start',evidence:{confirmed:true,note:'Learn a rally',confidence:3}}).state;
 const first=await db.query<{commit_progress:boolean}>('select public.commit_progress($1,1,$2::jsonb)',[alice,JSON.stringify(next)]);expect(first.rows[0].commit_progress).toBe(true);
 const retry=await db.query<{commit_progress:boolean}>('select public.commit_progress($1,1,$2::jsonb)',[alice,JSON.stringify(next)]);expect(retry.rows[0].commit_progress).toBe(false);
 const ledger=await db.query<{total:number;count:number}>('select sum(amount)::int as total,count(*)::int as count from public.xp_ledger where user_id=$1',[alice]);expect(ledger.rows[0]).toEqual({total:45,count:2});
 const unlocks=await db.query<{count:number}>('select count(*)::int as count from public.user_avatar_unlocks where user_id=$1',[alice]);expect(unlocks.rows[0].count).toBeGreaterThan(10);
 const progress=await db.query<{status:string}>('select status from public.node_progress where user_id=$1',[alice]);expect(progress.rows[0].status).toBe('completed');
});
it('isolates users with actual PostgreSQL RLS and denies client reward writes',async()=>{
 await db.query('select public.commit_progress($1,0,$2::jsonb)',[bob,JSON.stringify(initialState())]);
 await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${bob}',false);`);
 try{const all=await db.query<{user_id:string}>('select user_id from public.progress_snapshots');expect(all.rows.map(r=>r.user_id)).toEqual([bob]);const other=await db.query('select * from public.xp_ledger where user_id=$1',[alice]);expect(other.rows).toHaveLength(0);await expect(db.query('select public.commit_progress($1,2,$2::jsonb)',[alice,JSON.stringify(initialState())])).rejects.toThrow(/permission denied/);await expect(db.exec(`insert into public.xp_ledger(user_id,source_type,source_id,amount,idempotency_key) values('${bob}','forged','forged',999,'forged')`)).rejects.toThrow(/permission denied/);}finally{await db.exec('reset role');}
});
it('rolls back the entire aggregate when a projection violates integrity',async()=>{const s=initialState();s.progress['nonexistent-node']={status:'completed',startedAt:new Date().toISOString()};await expect(db.query('select public.commit_progress($1,1,$2::jsonb)',[bob,JSON.stringify(s)])).rejects.toThrow();const result=await db.query<{revision:number;state:unknown}>('select revision,state from public.progress_snapshots where user_id=$1',[bob]);expect(Number(result.rows[0].revision)).toBe(1);expect(result.rows[0].state).toEqual(initialState());});
it('persists desktop/calendar preferences and only projects milestone cosmetics after earning them',async()=>{
 let s=initialState();s.profile.dockPosition='left';s.plans=[{id:crypto.randomUUID(),date:'2026-09-16',hobbyId:'journaling',duration:20,note:'Reflection'}];s.windows.settings={appId:'settings',isOpen:true,isMinimized:false,isMaximized:false,zIndex:1,x:20,y:20,width:700,height:500,route:'/settings'};
 await db.query('select public.commit_progress($1,1,$2::jsonb)',[bob,JSON.stringify(s)]);
 const locked=await db.query<{count:number}>("select count(*)::int as count from public.user_avatar_unlocks u join public.avatar_items a on a.id=u.avatar_item_id where u.user_id=$1 and a.slug='prop-pen-sword'",[bob]);expect(locked.rows[0].count).toBe(0);
 const snapshot=await db.query<{state:typeof s}>('select state from public.progress_snapshots where user_id=$1',[bob]);expect(snapshot.rows[0].state.plans).toEqual(s.plans);expect(snapshot.rows[0].state.windows).toEqual(s.windows);expect(snapshot.rows[0].state.profile.dockPosition).toBe('left');
 s={...s,progress:{'jou-90':{status:'completed',startedAt:'2026-09-16T12:00:00Z'}}};await db.query('select public.commit_progress($1,2,$2::jsonb)',[bob,JSON.stringify(s)]);
 const earned=await db.query<{count:number}>("select count(*)::int as count from public.user_avatar_unlocks u join public.avatar_items a on a.id=u.avatar_item_id where u.user_id=$1 and a.slug='prop-pen-sword'",[bob]);expect(earned.rows[0].count).toBe(1);
});
