'use client';
import {useState} from 'react';
import {useGame} from '../provider';
import {hobbies} from '@/lib/content';
import {placementQuestions,scorePlacement} from '@/content/placement';
import {tiers} from '@/lib/content';
/** Self-reported experience, per hobby. There are no wrong answers, it awards nothing, and it can
 * never skip a safety node — it only changes what the app suggests first. */
export function PlacementStep({hobbyIds,onDone}:{hobbyIds:string[];onDone:()=>void}){
 const {run,busy}=useGame();const [index,setIndex]=useState(0);const [answers,setAnswers]=useState<Record<string,number>>({});
 const list=hobbyIds.filter(id=>placementQuestions[id]?.length);
 if(!list.length){onDone();return null;}
 const hobbyId=list[Math.min(index,list.length-1)],hobby=hobbies.find(h=>h.id===hobbyId)!;
 const questions=placementQuestions[hobbyId];
 const advance=async(skipped:boolean)=>{
  if(!await run({type:'placement',hobbyId:hobbyId as never,answers:skipped?{}:answers,skipped}))return;
  setAnswers({});
  if(index+1<list.length)setIndex(index+1);else onDone();
 };
 return <><h2>{hobby.icon} {hobby.name}</h2>
  <p>A few questions so we can suggest the right place to start. There are no wrong answers, and this earns no XP.</p>
  <p className="metadata">Hobby {index+1} of {list.length}. Skipping is fine — you can retake this any time.</p>
  <div className="placement-questions">{questions.map(q=><fieldset key={q.id} className="placement-question"><legend>{q.prompt}</legend>
   {q.options.map(o=><label key={o.label} className="checkbox-row"><input type="radio" name={q.id} checked={answers[q.id]===o.score} onChange={()=>setAnswers(a=>({...a,[q.id]:o.score}))}/>{o.label}</label>)}
  </fieldset>)}</div>
  <p className="metadata" role="status">Suggested start: {tiers[scorePlacement(hobbyId,answers)]}</p>
  <button className="button primary" disabled={busy} onClick={()=>void advance(false)}>{index+1<list.length?'NEXT HOBBY':'CONTINUE'}</button>
  <button className="button" disabled={busy} onClick={()=>void advance(true)}>SKIP {hobby.name.toUpperCase()}</button></>;
}
