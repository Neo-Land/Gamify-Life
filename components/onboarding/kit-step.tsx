'use client';
import {useGame} from '../provider';
import {gear,hobbies,pricesCheckedAt,type GearItem} from '@/lib/content';
import {firstQuests,type QuickHobby} from '@/lib/quick-start';
import {readiness} from '@/lib/readiness';
const ORDER=['required','recommended','optional'] as const;
/** The step that delivers the promise: what you have, what you can borrow, what is still in the way.
 * Borrowing is a first-class answer, never a lesser one. */
export function KitStep({hobbyIds,onDone}:{hobbyIds:string[];onDone:()=>void}){
 const {state,run,busy}=useGame();
 const list=hobbyIds.length?hobbyIds:state.enrollments;
 return <><h2>What do you already have?</h2>
  <p>Borrowing counts. Nothing here is a purchase list — it is what stands between you and a first session.</p>
  <p className="metadata">Costs are estimates, checked {pricesCheckedAt}.</p>
  {list.map(id=>{const hobby=hobbies.find(h=>h.id===id);if(!hobby)return null;
   const items=(gear as GearItem[]).filter(g=>g.hobbyId===id&&g.necessity!=='not_needed')
    .sort((a,b)=>ORDER.indexOf(a.necessity as typeof ORDER[number])-ORDER.indexOf(b.necessity as typeof ORDER[number]));
   const r=readiness(state,id);
   return <section key={id} className="kit-hobby"><h3>{hobby.icon} {hobby.name}</h3>
    {items.map(g=><div key={g.id} className="kit-row">
     <div><strong>{g.name}</strong> <small className="metadata">{g.necessity}</small>
      <p className="metadata">{g.guidance}</p>
      <p className="metadata">{g.cost.high===0?'Free':g.cost.low===g.cost.high?`$${g.cost.low}`:`$${g.cost.low}–$${g.cost.high}`}{g.borrowable&&' · can borrow'}</p>
      {g.freeAlternative&&<p className="metadata">{g.freeAlternative}</p>}</div>
     <div className="kit-controls" role="group" aria-label={`${g.name} status`}>
      {([['owned','I have this'],['borrowing','I can borrow this'],['need','I still need this']] as const).map(([value,label])=>
       <button key={value} className={`button small ${state.gear[g.id]===value?'selected':''}`} aria-pressed={state.gear[g.id]===value} disabled={busy}
        onClick={()=>void run({type:'gear',gearId:g.id,status:value})}>{label}</button>)}
      <button className="text-button" disabled={busy} aria-pressed={state.gear[g.id]==='not_needed'} onClick={()=>void run({type:'gear',gearId:g.id,status:'not_needed'})}>not needed</button>
     </div></div>)}
    <p className="kit-readiness" role="status">{r.ready
     ?<>You can start today. <button className="text-button" onClick={onDone}>{firstQuests[id as QuickHobby].action}</button></>
     :<>{r.missing.length===1?'One thing to sort out first':`${r.missing.length} things to sort out first`}: {r.missing.map(g=>g.name).join(', ')}. Estimated {r.lowTotal===r.highTotal?`$${r.lowTotal}`:`$${r.lowTotal}–$${r.highTotal}`}.</>}</p>
   </section>;})}
  <button className="button primary" disabled={busy} onClick={onDone}>OPEN MY DESKTOP</button></>;
}
