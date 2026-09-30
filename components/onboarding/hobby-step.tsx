'use client';
import {useState} from 'react';
import {PixelSprite} from '../pixel-sprite';
import {useGame} from '../provider';
import {byStartupCost,costBadge,hobbies,pricesCheckedAt,type hobbyIds} from '@/lib/content';
export function HobbyStep({onDone}:{onDone:(picked:string[])=>void}){
 const {state,run,busy}=useGame();const [selected,setSelected]=useState<string[]>(state.enrollments);
 return <><h2>A little curiosity goes a long way.</h2><p>You can add or pause hobbies later.</p>
  <p className="metadata">Costs are estimates, checked {pricesCheckedAt}. Borrowing counts.</p>
  <div className="onboarding-choices">{byStartupCost(hobbies).map(h=><button key={h.id} className={selected.includes(h.id)?'selected':''} aria-pressed={selected.includes(h.id)} onClick={()=>setSelected(old=>old.includes(h.id)?old.filter(x=>x!==h.id):[...old,h.id])}><PixelSprite name={h.id} size={36}/><strong>{h.name}</strong><small>{h.description}</small><small>{costBadge(h.id)}</small><small className="metadata">{h.startSummary}</small></button>)}</div>
  <button className="button primary" disabled={busy||!selected.length} onClick={async()=>{if(await run({type:'enroll',hobbyIds:selected as unknown as typeof hobbyIds[number][]}))onDone(selected);}}>CONTINUE</button></>;
}
