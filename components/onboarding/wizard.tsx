'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {PixelSprite} from '../pixel-sprite';
import {useGame} from '../provider';
import {CharacterStep} from './character-step';
import {HobbyStep} from './hobby-step';
import {PlacementStep} from './placement-step';
import {KitStep} from './kit-step';
/** Character → Hobbies → Quick check-in → Start kit. Every step after the character is skippable:
 * the point of the whole flow is to remove reasons not to start. */
const titles=['CHARACTER SETUP','CHOOSE YOUR PATH','QUICK CHECK-IN','YOUR START KIT'];
export function Setup(){
 const {state,run,busy,error}=useGame();const router=useRouter();
 const [step,setStep]=useState(state.profile.characterCreated?1:0);
 const [picked,setPicked]=useState<string[]>(state.enrollments);
 const finish=async()=>{if(await run({type:'profile',input:{onboardingComplete:true}}))router.push('/home');};
 return <div className="entry-screen setup-screen"><section className="mac-window setup-window">
  <div className="titlebar"><PixelSprite name="settings" size={20}/><h1>{titles[step]}</h1><span>{step+1} / 4</span></div>
  <div className="window-pad">
   {error&&<p className="inline-error" role="alert">{error}</p>}
   {step===0&&<CharacterStep onDone={()=>setStep(1)}/>}
   {step===1&&<HobbyStep onDone={p=>{setPicked(p);setStep(2);}}/>}
   {step===2&&<PlacementStep hobbyIds={picked} onDone={()=>setStep(3)}/>}
   {step===3&&<KitStep hobbyIds={picked} onDone={finish}/>}
   <div className="setup-actions">
    {step>0&&<button className="button" disabled={busy} onClick={()=>setStep(step-1)}>BACK</button>}
    {step>=2&&<button className="button" disabled={busy} onClick={()=>step===3?void finish():setStep(step+1)}>SKIP THIS STEP</button>}
   </div>
  </div></section></div>;
}
