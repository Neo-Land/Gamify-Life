'use client';
import {useState} from 'react';
import {CharacterCreator} from '../character-creator';
import {useGame} from '../provider';
import {randomTint} from '@/lib/tints';
export function CharacterStep({onDone}:{onDone:()=>void}){
 const {state,run,busy}=useGame();const [name,setName]=useState(state.profile.name);
 return <><label className="field">Character name<input value={name} maxLength={40} onChange={e=>setName(e.target.value)}/></label><CharacterCreator/>
  <button className="button primary full" disabled={busy||!name.trim()} onClick={async()=>{if(await run({type:'profile',input:{name,characterCreated:true}}))onDone();}}>CREATE CHARACTER</button>
  <button className="button full" disabled={busy} onClick={async()=>{if(await run({type:'profile',input:{name:name.trim()||'Player',characterCreated:true,characterSkipped:true,characterTint:randomTint()}}))onDone();}}>SKIP FOR NOW</button>
  <p className="metadata center">We’ll give you a placeholder. You can design your character any time from the Character app.</p></>;
}
