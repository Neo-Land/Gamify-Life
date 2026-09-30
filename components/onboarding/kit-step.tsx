'use client';
import {useEffect,useRef,useState} from 'react';
import {PixelSprite} from '../pixel-sprite';
import {useGame} from '../provider';
import {gear,hobbies,pricesCheckedAt,usdRange,type GearItem} from '@/lib/content';
import {firstQuests,type QuickHobby} from '@/lib/quick-start';
import {readiness} from '@/lib/readiness';
const ORDER=['required','recommended','optional'] as const;
/** The step that delivers the promise: what you have, what you can borrow, what is still in the way.
 * Borrowing is a first-class answer, never a lesser one. */
export function KitStep({hobbyIds,onDone}:{hobbyIds:string[];onDone:()=>void}){
 const {state,run,busy}=useGame();
 const list=hobbyIds.length?hobbyIds:state.enrollments;const [index,setIndex]=useState(0);
 // One hobby per page: several hobbies stacked meant scrolling past kit you had already sorted.
 // A new hobby starts at the top: the page was left scrolled down at the NEXT HOBBY button.
 const top=useRef<HTMLHeadingElement>(null),shown=useRef(index);useEffect(()=>{if(shown.current===index)return;shown.current=index;top.current?.scrollIntoView({block:'start'});top.current?.focus({preventScroll:true});},[index]);
 const only=list.slice(Math.min(index,list.length-1),Math.min(index,list.length-1)+1),last=index>=list.length-1;
 return <><h2 ref={top} tabIndex={-1}>What do you already have?</h2>
  <p className="metadata">Borrowing counts. Costs are estimates, checked {pricesCheckedAt}.</p>
  {only.map(id=>{const hobby=hobbies.find(h=>h.id===id);if(!hobby)return null;
   const items=(gear as GearItem[]).filter(g=>g.hobbyId===id&&g.necessity!=='not_needed')
    .sort((a,b)=>ORDER.indexOf(a.necessity as typeof ORDER[number])-ORDER.indexOf(b.necessity as typeof ORDER[number]));
   const r=readiness(state,id);
   return <section key={id} className="kit-hobby"><h3><PixelSprite name={hobby.id} size={24}/> {hobby.name}</h3>
    {items.map(g=><div key={g.id} className="kit-row">
     <div><strong>{g.name}</strong> <small className="metadata">{g.necessity} · {g.cost.high===0?'Free':usdRange(g.cost.low,g.cost.high)}</small>
      <details className="kit-guidance"><summary>Details</summary><p>{g.guidance}</p>{g.freeAlternative&&<p className="metadata">{g.freeAlternative}</p>}</details></div>
     <div className="kit-controls" role="group" aria-label={`${g.name} status`}>
      {([['owned','Owned'],['borrowing','Borrow'],['need','Need'],['not_needed','Not needed']] as const).map(([value,label])=>
       <button key={value} className={`button small ${state.gear[g.id]===value?'selected':''}`} aria-pressed={state.gear[g.id]===value} disabled={busy}
        onClick={()=>void run({type:'gear',gearId:g.id,status:value})}>{label}</button>)}
     </div></div>)}
    <p className="kit-readiness" role="status">{r.ready
     ?<>You can start today. <button className="text-button" onClick={onDone}>{firstQuests[id as QuickHobby].action}</button></>
     :<>{r.missing.length===1?'One thing to sort out first':`${r.missing.length} things to sort out first`}: {r.missing.map(g=>g.name).join(', ')}. Estimated {usdRange(r.lowTotal,r.highTotal)}.</>}</p>
   </section>;})}
  <div className="placement-actions">
   <div>{index>0&&<button className="button" onClick={()=>setIndex(index-1)}>PREVIOUS</button>}</div>
   <div>{list.length>1&&<span className="metadata">{index+1} / {list.length}</span>}
    {last?<button className="button primary" disabled={busy} onClick={onDone}>OPEN MY DESKTOP</button>
     :<button className="button primary" onClick={()=>setIndex(index+1)}>NEXT HOBBY</button>}</div>
  </div></>;
}
