'use client';
import {useEffect,useState} from 'react';
import {PixelSprite} from '../pixel-sprite';
import {useGame} from '../provider';
import {hobbies} from '@/lib/content';
import {placementQuestions,scorePlacement} from '@/content/placement';
import {tiers} from '@/lib/content';
/** Self-reported experience, per hobby. There are no wrong answers, it awards nothing, and it can
 * never skip a safety node — it only changes what the app suggests first.
 * One question per screen: five stacked fieldsets meant scrolling on a phone to reach the button.
 * `retake` is the same questions reopened from a hobby's map: prefilled with the last answers, and
 * Cancel leaves the old result alone instead of recording a skip over it. */
export function PlacementStep({hobbyIds,onDone,retake=false}:{hobbyIds:string[];onDone:()=>void;retake?:boolean}){
 const {state,run,busy}=useGame();const list=hobbyIds.filter(id=>placementQuestions[id]?.length);const [index,setIndex]=useState(0);const [step,setStep]=useState(0);const [answers,setAnswers]=useState<Record<string,number>>(()=>retake&&list[0]?state.placements[list[0]]?.answers??{}:{});
 useEffect(()=>{if(!list.length)onDone();},[list.length,onDone]);
 if(!list.length)return null;
 const hobbyId=list[Math.min(index,list.length-1)],hobby=hobbies.find(h=>h.id===hobbyId)!;
 const questions=placementQuestions[hobbyId],q=questions[Math.min(step,questions.length-1)],last=step>=questions.length-1;
 const advance=async(skipped:boolean)=>{
  if(!await run({type:'placement',hobbyId:hobbyId as never,answers:skipped?{}:answers,skipped}))return;
  setAnswers({});setStep(0);
  if(index+1<list.length)setIndex(index+1);else onDone();
 };
 return <><h2><PixelSprite name={hobby.id} size={28}/> {hobby.name}</h2>
  <p className="metadata">No wrong answers, and no XP either way.</p>
  {!retake&&list.length>1&&<p className="metadata">Hobby {index+1} of {list.length}</p>}
  <fieldset className="placement-question"><legend>{q.prompt}</legend>
   {q.options.map(o=><label key={o.label} className="checkbox-row"><input type="radio" name={q.id} checked={answers[q.id]===o.score} onChange={()=>setAnswers(a=>({...a,[q.id]:o.score}))}/>{o.label}</label>)}
  </fieldset>
  {last&&<p className="metadata" role="status">Suggested start: {tiers[scorePlacement(hobbyId,answers)]}</p>}
  <div className="placement-actions">
   <div>{step>0?<button className="button" onClick={()=>setStep(step-1)}>PREVIOUS</button>
    :retake?<button className="button" disabled={busy} onClick={onDone}>CANCEL</button>
    :<button className="button" disabled={busy} onClick={()=>void advance(true)}>SKIP</button>}</div>
   <div><span className="metadata">{step+1} / {questions.length}</span>
    {last?<button className="button primary" disabled={busy} onClick={()=>void advance(false)}>{retake?'SAVE CHECK-IN':index+1<list.length?'NEXT HOBBY':'CONTINUE'}</button>
     :<button className="button primary" onClick={()=>setStep(step+1)}>NEXT</button>}</div>
  </div></>;
}
