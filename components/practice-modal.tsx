'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {useGame} from './provider';
import {Modal} from './ui';
import {hobbies,nodeById,type hobbyIds} from '@/lib/content';
import {done,practicePrerequisites} from '@/lib/progression';
type Props={open:boolean;onClose:()=>void;hobbyId:string;nodeId?:string};
export function PracticeModal({open,onClose,hobbyId,nodeId}:Props){
 const {busy}=useGame();
 const hobby=hobbies.find(h=>h.id===hobbyId);
 return <Modal open={open} onClose={()=>{if(!busy)onClose();}} title={`A little practice · ${hobby?.name||hobbyId}`} description="Earn 20 XP for your first logged session in each hobby each day. Every session still counts.">
  {open&&<PracticeForm key={`${hobbyId}:${nodeId||''}`} hobbyId={hobbyId} nodeId={nodeId} onClose={onClose}/>}
 </Modal>;
}
function PracticeForm({hobbyId,nodeId,onClose}:Omit<Props,'open'>){
 const {state,run,busy,clearError}=useGame();
 const [duration,setDuration]=useState('20');
 const [note,setNote]=useState('');
 const [confirmed,setConfirmed]=useState(false);
 const [validation,setValidation]=useState('');
 const [saved,setSaved]=useState<{minutes:number;xp:number}|null>(null);
 const submitting=useRef(false);
 const submissionId=useRef<string|null>(null);
 const missing=practicePrerequisites(hobbyId).filter(id=>!done(state,id));
 const hobby=hobbies.find(h=>h.id===hobbyId)!;
 if(saved)return <div className="practice-saved" role="status">
  <h2>Practice saved</h2><p>{saved.minutes} minutes of {hobby.name.toLowerCase()} added to your practice journal.</p>
  <p>{saved.xp>0?`+${saved.xp} XP earned.`:'Your session counts. Today’s practice XP for this hobby was already earned.'}</p>
  <button className="button primary full" onClick={onClose}>Done</button>
 </div>;
 return <form noValidate onSubmit={async e=>{
  e.preventDefault();if(submitting.current)return;clearError();setValidation('');
  if(missing.length){setValidation('Finish the safety skills linked below before logging practice.');return;}
  const minutes=Number(duration);
  if(!duration.trim()||!Number.isInteger(minutes)||minutes<1||minutes>1440){setValidation('Enter a whole number of minutes between 1 and 1,440.');return;}
  if(!confirmed){setValidation('Please confirm that you practiced safely before saving.');return;}
  submitting.current=true;
  try{
   submissionId.current??=crypto.randomUUID();
   const result=await run({type:'practice',id:submissionId.current,hobbyId:hobbyId as typeof hobbyIds[number],nodeId,duration:minutes,note});
   if(result)setSaved({minutes,xp:result.xpAwarded});
  }catch{setValidation('Your session could not be saved. Please try again.');}
  finally{submitting.current=false;}
 }}>
  {missing.length>0&&<div className="practice-prerequisites" role="note"><h3>Before logging practice</h3><p>Complete these safety skills first:</p>{missing.map(id=><Link className="path-link" key={id} href={`/hobbies/${hobbyId}/nodes/${id}`} onClick={onClose}>{nodeById(id)!.title} ↗</Link>)}</div>}
  {validation&&<p className="inline-error" role="alert">{validation}</p>}
  <label className="field">Minutes practiced<input type="number" min="1" max="1440" step="1" required value={duration} onChange={e=>{setDuration(e.target.value);setValidation('');}}/></label>
  <label className="field">Private reflection (optional)<textarea maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label>
  <label className="checkbox-row"><input type="checkbox" checked={confirmed} required onChange={e=>{setConfirmed(e.target.checked);setValidation('');}}/>I practiced safely in a suitable environment.</label>
  <button className="button primary full" disabled={busy||missing.length>0}>{busy?'Saving practice…':'Save practice'}</button>
  {missing.length>0&&<p className="metadata">Saving unlocks after the safety skills above are completed.</p>}
  <button type="button" className="button full" disabled={busy} onClick={onClose}>Cancel</button>
 </form>;
}
