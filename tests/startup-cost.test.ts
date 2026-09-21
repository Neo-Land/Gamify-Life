import {describe,expect,it} from 'vitest';
import {costBadge,gear,hobbies,pricesCheckedAt,startupCost,type GearItem} from '../lib/content';
describe('startup cost',()=>{
 it('prices every gear item and marks whether it can be borrowed',()=>{
  for(const g of gear as GearItem[]){
   expect(g.cost,`${g.id} cost`).toBeTruthy();
   expect(g.cost.high,`${g.id} range`).toBeGreaterThanOrEqual(g.cost.low);
   expect(Number.isInteger(g.cost.low)&&Number.isInteger(g.cost.high),`${g.id} whole USD`).toBe(true);
   expect(typeof g.borrowable,`${g.id} borrowable`).toBe('boolean');
  }
 });
 it('reports zero low for a hobby whose required gear is all borrowable',()=>{
  const reading=startupCost('reading');
  expect(reading.low).toBe(0);
  expect(reading.borrowedPath).toBe(true);
  expect(costBadge('reading')).toBe('FREE TO TRY');
 });
 it('sums the buy-everything ceiling and ignores borrowable items in the floor',()=>{
  for(const h of hobbies){
   const required=(gear as GearItem[]).filter(g=>g.hobbyId===h.id&&g.necessity==='required');
   const c=startupCost(h.id);
   expect(c.high).toBe(required.reduce((a,g)=>a+g.cost.high,0));
   expect(c.low).toBe(required.reduce((a,g)=>a+(g.borrowable?0:g.cost.low),0));
   expect(c.low).toBeLessThanOrEqual(c.high);
  }
 });
 it('never sets borrowedPath where a required item cannot honestly be borrowed',()=>{
  // A helmet is the case that matters: fit and crash history make borrowing unsafe.
  expect((gear as GearItem[]).find(g=>g.id==='cycling-0')!.borrowable).toBe(false);
  expect(startupCost('cycling').borrowedPath).toBe(false);
 });
 it('carries meaning in the badge text, not in colour',()=>{
  for(const h of hobbies){
   const badge=costBadge(h.id);
   expect(badge).toMatch(/FREE TO TRY|\$\d/);
   expect(badge.length,`${h.id} badge stays one line`).toBeLessThanOrEqual(34);
  }
  expect(pricesCheckedAt).toMatch(/^\d{4}-\d{2}$/);
 });
});
