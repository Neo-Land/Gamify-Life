'use client';
import {useGame} from './provider';
import {Avatar} from './avatar';
import {bodyRigIds,bodyRigLabels} from '@/lib/body-rigs';
/** Three builds, each shown on the player's own character so the choice is about shape, not a label. */
export function BodySelector(){const {state,run,busy}=useGame();return <fieldset className="build-picker"><legend>BUILD</legend><div className="build-choices">{bodyRigIds.map(id=><button key={id} className="closet-item" aria-pressed={state.profile.bodyRigId===id} aria-label={`${bodyRigLabels[id]} build`} disabled={busy} onClick={()=>void run({type:'profile',input:{bodyRigId:id}})}><Avatar selection={state.avatar} tint={state.profile.characterTint} bodyRigId={id} viewBox="40 250 176 126" decorative/><span>{bodyRigLabels[id]}</span></button>)}</div><p className="metadata">Every build is open to everyone, and everything in the closet fits each one.</p></fieldset>;}
