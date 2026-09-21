import {describe,expect,it} from 'vitest';
import {placementQuestions,scorePlacement} from '../content/placement';
import {initialState,stateSchema} from '../lib/domain';
import {applyCommand,available,myHobbies,otherHobbies,recommend,suggestedStart} from '../lib/progression';
import {gear,hobbyIds,nodes,tiers,type GearItem} from '../lib/content';
import {readiness} from '../lib/readiness';
const answersFor=(hobbyId:string,score:number)=>Object.fromEntries(placementQuestions[hobbyId].map(q=>[q.id,score]));
describe('placement check-in',()=>{
 it('covers every hobby with behaviour questions and one about equipment access',()=>{
  for(const id of hobbyIds){
   const qs=placementQuestions[id];
   expect(qs?.length,`${id} questions`).toBeGreaterThanOrEqual(4);
   expect(qs.some(q=>/access|have|materials|footwear|paints|write in|to read|work with/i.test(q.prompt)),`${id} asks about access`).toBe(true);
   expect(qs.some(q=>/last/i.test(q.prompt)),`${id} asks how recently`).toBe(true);
   for(const q of qs){
    expect(q.prompt.length,`${id} ${q.id} prompt length`).toBeLessThanOrEqual(90);
    expect(/health|injur|weight|age|condition/i.test(q.prompt),`${id} ${q.id} asks nothing medical`).toBe(false);
   }
  }
 });
 it('scores each ratio boundary onto the right tier',()=>{
  expect(scorePlacement('running',answersFor('running',0))).toBe(0);
  expect(scorePlacement('running',answersFor('running',1))).toBe(1);
  expect(scorePlacement('running',answersFor('running',2))).toBe(2);
  expect(scorePlacement('running',answersFor('running',3))).toBe(3);
  expect(scorePlacement('running',{})).toBe(0);
  expect(scorePlacement('not-a-hobby',{})).toBe(0);
 });
 it('writes no ledger entry, no XP and no achievement',()=>{
  const before=applyCommand(initialState(),{type:'enroll',hobbyIds:['running']}).state;
  const r=applyCommand(before,{type:'placement',hobbyId:'running',answers:answersFor('running',3),skipped:false});
  expect(r.xpAwarded).toBe(0);
  expect(r.state.ledger).toEqual(before.ledger);
  expect(r.state.achievements).toEqual(before.achievements);
  expect(r.state.placements.running.level).toBe(3);
 });
 it('overwrites rather than stacking when retaken, and skipping behaves like today',()=>{
  let s=applyCommand(initialState(),{type:'placement',hobbyId:'running',answers:answersFor('running',3),skipped:false}).state;
  s=applyCommand(s,{type:'placement',hobbyId:'running',answers:answersFor('running',0),skipped:false}).state;
  expect(s.placements.running.level).toBe(0);
  s=applyCommand(s,{type:'placement',hobbyId:'running',answers:answersFor('running',3),skipped:true}).state;
  expect(s.placements.running).toMatchObject({level:0,skipped:true,answers:{}});
 });
 it('parses a snapshot that predates placements',()=>{
  const legacy=JSON.parse(JSON.stringify(initialState())) as Record<string,unknown>;
  delete legacy.placements;
  expect(stateSchema.parse(legacy).placements).toEqual({});
 });
 it('never promotes a node past an unmet safety requirement',()=>{
  let s=applyCommand(initialState(),{type:'enroll',hobbyIds:['swimming']}).state;
  s=applyCommand(s,{type:'placement',hobbyId:'swimming',answers:answersFor('swimming',3),skipped:false}).state;
  const next=recommend(s)!;
  expect(available(next,s)).toBe(true);
  // Placement is a tiebreaker only: a gated node stays gated however experienced you say you are.
  const gated=nodes.find(n=>n.id==='swi-breathing'||(n.hobbyId==='swimming'&&n.requires.includes('swi-safety')))!;
  if(gated)expect(available(gated,s)).toBe(false);
 });
 it('suggests an entry point at the placed tier without hiding anything below it',()=>{
  let s=applyCommand(initialState(),{type:'enroll',hobbyIds:['reading']}).state;
  s=applyCommand(s,{type:'placement',hobbyId:'reading',answers:answersFor('reading',3),skipped:false}).state;
  const start=suggestedStart(s,'reading')!;
  expect(start).toBeTruthy();
  expect(available(start,s)).toBe(true);
  expect(tiers).toContain(start.tier);
  expect(nodes.filter(n=>n.hobbyId==='reading'&&available(n,s)).length).toBeGreaterThan(0);
 });
});
describe('start kit readiness',()=>{
 it('counts borrowing as having it, and need as blocking',()=>{
  const s=initialState();
  const required=(gear as GearItem[]).filter(g=>g.hobbyId==='volleyball'&&g.necessity==='required');
  expect(readiness(s,'volleyball').ready).toBe(false);
  for(const g of required)s.gear[g.id]='borrowing';
  expect(readiness(s,'volleyball').ready).toBe(true);
  s.gear[required[0].id]='need';
  const r=readiness(s,'volleyball');
  expect(r.ready).toBe(false);
  expect(r.missing.map(g=>g.id)).toEqual([required[0].id]);
  expect(r.highTotal).toBeGreaterThanOrEqual(r.lowTotal);
 });
 it('accepts all five statuses and still parses three-value snapshots',()=>{
  let s=initialState();
  for(const status of ['owned','borrowing','need','wishlist','not_needed'] as const)
   s=applyCommand(s,{type:'gear',gearId:'reading-0',status}).state;
  expect(s.gear['reading-0']).toBe('not_needed');
  const legacy=JSON.parse(JSON.stringify(initialState())) as {gear:Record<string,string>};
  legacy.gear={'tennis-0':'owned','tennis-1':'wishlist','tennis-2':'not_needed'};
  expect(Object.keys(stateSchema.parse(legacy).gear)).toHaveLength(3);
 });
 it('lets the gear node pass on borrowing and fail on need, for every hobby',()=>{
  for(const id of hobbyIds){
   const prefix=nodes.find(n=>n.hobbyId===id)!.id.split('-')[0];
   const gearNode=nodes.find(n=>n.id===`${prefix}-gear`);
   if(!gearNode)continue;
   const required=(gear as GearItem[]).filter(g=>g.hobbyId===id&&g.necessity==='required');
   const s=applyCommand(initialState(),{type:'enroll',hobbyIds:[id]}).state;
   for(const r of gearNode.requires)s.progress[r]={status:'completed',startedAt:'x',completedAt:'x'};
   for(const g of required)s.gear[g.id]='borrowing';
   expect(()=>applyCommand(s,{type:'complete',nodeId:gearNode.id,evidence:{confirmed:true,note:'have it',confidence:3}}),`${id} borrowing`).not.toThrow();
   s.gear[required[0].id]='need';
   expect(()=>applyCommand(s,{type:'complete',nodeId:gearNode.id,evidence:{confirmed:true,note:'have it',confidence:3}}),`${id} need`).toThrow();
  }
 });
});

describe('desktop shows only chosen hobbies',()=>{
 it('separates chosen from the rest, with nothing lost between them',()=>{
  const s=applyCommand(initialState(),{type:'enroll',hobbyIds:['running','reading']}).state;
  expect(myHobbies(s).map(h=>h.id).sort()).toEqual(['reading','running']);
  expect(otherHobbies(s).map(h=>h.id)).not.toContain('running');
  expect(myHobbies(s).length+otherHobbies(s).length).toBe(hobbyIds.length);
 });
 it('moves a hobby across when it is started, and back when it is paused',()=>{
  let s=applyCommand(initialState(),{type:'enroll',hobbyIds:['reading']}).state;
  expect(otherHobbies(s).map(h=>h.id)).toContain('painting');
  s=applyCommand(s,{type:'enroll',hobbyIds:['painting']}).state;
  expect(myHobbies(s).map(h=>h.id)).toContain('painting');
  s=applyCommand(s,{type:'pause-hobby',hobbyId:'painting'}).state;
  expect(myHobbies(s).map(h=>h.id)).not.toContain('painting');
  expect(otherHobbies(s).map(h=>h.id)).toContain('painting');
 });
 it('offers the whole catalogue to a player who has none',()=>{
  const s=initialState();
  expect(myHobbies(s)).toEqual([]);
  expect(otherHobbies(s)).toHaveLength(hobbyIds.length);
 });
});
