import {describe,expect,it} from 'vitest';
import {byStartupCost,costBadge,gear,hobbies,pricesCheckedAt,startupCost,usdRange,type GearItem} from '../lib/content';
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
  expect(costBadge('reading')).toBe('FREE TO TRY · CAN BORROW');
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
 it('never offers a hygiene or fit-critical item as borrowable or used',()=>{
  // Helmets carry crash history, goggles and swimwear are hygiene, and a used running shoe carries
  // someone else's wear pattern. Borrowing these would make the number smaller and the advice worse.
  for(const name of ['Helmet','Goggles','Swimsuit','Running shoes','Power supply']){const g=(gear as GearItem[]).find(g=>g.name===name)!;expect(g,name).toBeTruthy();expect(g.borrowable,name).toBe(false);expect(g.usedOk,name).toBe(false);}
 });
 it('treats free-to-try and can-borrow as independent',()=>{
  // Journaling costs nothing to start, but nothing in it is borrowed.
  expect(startupCost('journaling')).toMatchObject({low:0,borrowedPath:false,tier:'free'});
  expect(costBadge('journaling')).toBe('FREE TO TRY · UP TO $25');
 });
 it('formats money with separators and leads the picker with the free hobbies',()=>{
  expect(usdRange(629,1580)).toBe('$629–$1,580');expect(usdRange(0,0)).toBe('$0');
  const ordered=byStartupCost(hobbies);const lows=ordered.map(h=>startupCost(h.id).low);
  expect(lows).toEqual([...lows].sort((a,b)=>a-b));expect(ordered.slice(0,5).every(h=>startupCost(h.id).low===0)).toBe(true);
 });
 it('gives every hobby an honest upgrade range',()=>{for(const h of hobbies){expect(h.upgrade.high).toBeGreaterThan(h.upgrade.low);expect(h.upgrade.low).toBeGreaterThanOrEqual(0);expect(h.upgrade.note.length).toBeGreaterThan(10);}});
});
