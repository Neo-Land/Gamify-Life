// Real two-user integration test. Never use a production project for this suite.
import {it,expect} from 'vitest';
import {createClient} from '@supabase/supabase-js';
import {initialState} from '../lib/domain';
const url=process.env.TEST_SUPABASE_URL,key=process.env.TEST_SUPABASE_ANON_KEY,service=process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
it.skipIf(!url||!key||!service)('isolates two authenticated users and rejects direct XP / RPC writes',async()=>{
 const admin=createClient(url!,service!,{auth:{persistSession:false}});const ids:string[]=[];
 try{
  const clients=[];
  for(let i=0;i<2;i++){const email=`gamify-test-${crypto.randomUUID()}@example.com`,password=`Test-${crypto.randomUUID()}!`;const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});if(error)throw error;ids.push(data.user.id);const c=createClient(url!,key!,{auth:{persistSession:false}});const login=await c.auth.signInWithPassword({email,password});if(login.error)throw login.error;clients.push(c);const seeded=await admin.rpc('commit_progress',{p_user_id:data.user.id,p_expected_revision:0,p_state:initialState()});expect(seeded.error).toBeNull();}
  for(let i=0;i<2;i++){const other=ids[1-i];const read=await clients[i].from('progress_snapshots').select('*').eq('user_id',other);expect(read.error).toBeNull();expect(read.data).toEqual([]);const own=await clients[i].from('progress_snapshots').select('*').eq('user_id',ids[i]);expect(own.data).toHaveLength(1);const write=await clients[i].from('xp_ledger').insert({user_id:ids[i],source_type:'forged',source_id:'forged',amount:999,idempotency_key:'forged'});expect(write.error).not.toBeNull();const rpc=await clients[i].rpc('commit_progress',{p_user_id:other,p_expected_revision:1,p_state:initialState()});expect(rpc.error).not.toBeNull();}
 }finally{for(const id of ids)await admin.auth.admin.deleteUser(id);}
},30000);
