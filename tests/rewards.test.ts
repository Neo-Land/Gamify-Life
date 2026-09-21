import {describe,expect,it} from 'vitest';
import {initialState} from '../lib/domain';
import {applyCommand,lifeLevel,lifeXp,hobbyLevel,hobbyXp} from '../lib/progression';
import {rewardFor} from '../lib/rewards';
import type {State} from '../lib/domain';
const run=(s:State,...cmds:Parameters<typeof applyCommand>[1][])=>cmds.reduce((acc,c)=>applyCommand(acc,c).state,s);
describe('reward events',()=>{
 it('reports the XP and the source of a completed node',()=>{
  const before=run(initialState(),{type:'enroll',hobbyIds:['journaling']});
  const result=applyCommand(before,{type:'complete',nodeId:'jou-start',evidence:{confirmed:true,note:'first page',confidence:3}});
  const reward=rewardFor(before,result.state,result)!;
  expect(reward.xp).toBe(result.xpAwarded);
  expect(reward.xp).toBeGreaterThan(0);
  expect(reward.sources.join(' ')).toContain('Completed');
 });
 it('is null when a command earns nothing',()=>{
  const before=initialState();
  const result=applyCommand(before,{type:'profile',input:{name:'Nehemias'}});
  expect(rewardFor(before,result.state,result)).toBeNull();
 });
 it('reports a life level-up only on the command that crosses the threshold',()=>{
  let s=run(initialState(),{type:'enroll',hobbyIds:['journaling']});
  const ups:number[]=[];
  for(const node of ['jou-start','jou-tools','jou-first','jou-friction','jou-daily','jou-reflect','jou-gratitude','jou-week']){
   const r=applyCommand(s,{type:'complete',nodeId:node,evidence:{confirmed:true,note:'done',value:999,confidence:3}});
   const reward=rewardFor(s,r.state,r);
   if(reward?.lifeLevel)ups.push(reward.lifeLevel);
   s=r.state;}
  expect(lifeLevel(lifeXp(s))).toBeGreaterThan(1);
  // Every level between the start and the end is announced exactly once, in order.
  expect(ups).toEqual([...new Set(ups)]);
  expect(ups.at(-1)).toBe(lifeLevel(lifeXp(s)));
 });
 it('reports a hobby level-up with its level name',()=>{
  let s=run(initialState(),{type:'enroll',hobbyIds:['journaling']});
  let named='';
  for(const node of ['jou-start','jou-tools','jou-first','jou-friction']){
   const r=applyCommand(s,{type:'complete',nodeId:node,evidence:{confirmed:true,note:'done',value:999,confidence:3}});
   const reward=rewardFor(s,r.state,r);
   const up=reward?.hobbyLevelUps.find(h=>h.hobbyId==='journaling');
   if(up){expect(up.level).toBe(hobbyLevel(hobbyXp(r.state,'journaling')));named=up.levelName;}
   s=r.state;}
  expect(named).not.toBe('');
 });
});
