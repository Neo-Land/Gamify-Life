import {describe,expect,it} from 'vitest';
import {gear,hobbies,hobbyIds,nodes,quests,tiers} from '../lib/content';
import {lessons} from '../content/lessons';
import {firstQuests} from '../lib/quick-start';
/** The crash-prevention net. lib/content.ts does lessons[n.id].split('|') with no guard, so a node
 * without a lesson is a hard import-time crash and a blank app. These assertions are what let a
 * hobby be added as data only. */
describe('content integrity',()=>{
 it('gives every node a lesson and a unique id',()=>{
  const missing=nodes.filter(n=>!lessons[n.id]);
  expect(missing.map(n=>n.id)).toEqual([]);
  expect(new Set(nodes.map(n=>n.id)).size).toBe(nodes.length);
 });
 it('keeps every whyItMatters distinct',()=>{
  expect(new Set(nodes.map(n=>n.whyItMatters)).size).toBe(nodes.length);
 });
 it('keeps hobbies.json and hobbyIds in step, with unique three-letter prefixes',()=>{
  expect(hobbies.map(h=>h.id).sort()).toEqual([...hobbyIds].sort());
  expect(new Set(hobbies.map(h=>h.prefix)).size).toBe(hobbies.length);
  for(const h of hobbies)expect(h.prefix).toHaveLength(3);
 });
 it('gives every hobby a spine: nodes, a required gear item and a quest',()=>{
  for(const h of hobbies){
   expect(nodes.filter(n=>n.hobbyId===h.id).length,`${h.id} nodes`).toBeGreaterThan(0);
   expect(gear.filter(g=>g.hobbyId===h.id&&g.necessity==='required').length,`${h.id} required gear`).toBeGreaterThan(0);
   expect(quests.filter(q=>q.hobbyId===h.id).length,`${h.id} quest`).toBeGreaterThan(0);
   expect(firstQuests[h.id as keyof typeof firstQuests],`${h.id} first quest`).toBeTruthy();
  }
 });
 it('namespaces every node id under its hobby prefix and uses a known tier',()=>{
  // Cycling's fixed-gear branch was authored under its own `fixie-` family before prefixes were a
  // rule. Renaming those four would invalidate saved ledger keys and progress records, so they are
  // grandfathered rather than corrected. New hobbies get no such exception.
  const grandfathered=new Set(['fixie-intro','fixie-ratio','fixie-retention','fixie-control']);
  for(const n of nodes){
   const h=hobbies.find(h=>h.id===n.hobbyId)!;
   if(!grandfathered.has(n.id))expect(n.id.startsWith(`${h.prefix}-`),`${n.id} under ${h.prefix}`).toBe(true);
   expect(tiers).toContain(n.tier);
  }
 });
 it('points every practice prerequisite at a real node',()=>{
  for(const h of hobbies)for(const id of h.practicePrerequisites)
   expect(nodes.some(n=>n.id===id),`${h.id} prerequisite ${id}`).toBe(true);
 });
});
