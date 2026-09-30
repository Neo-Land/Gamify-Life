'use client';
import {useState} from 'react';
import {useGame} from './provider';
import {Modal} from './ui';
import {scenes,wallpaperIds,resolveWallpaper,seasonScene,type WallpaperChoice} from '@/lib/wallpapers';
/** The classic Display Properties dialog: monitor preview, wallpaper list, OK / Cancel / Apply.
 * "Auto" follows the season chosen under Desktop themes. Saves through the ordinary profile command. */
export function DisplayProperties({open,onClose}:{open:boolean;onClose:()=>void}){const {state,run,busy}=useGame();const [pick,setPick]=useState<WallpaperChoice>(state.profile.wallpaper);
 const apply=async()=>run({type:'profile',input:{wallpaper:pick}});
 return <Modal open={open} onClose={onClose} title="DISPLAY PROPERTIES" description="Choose a wallpaper for your desktop."><div className="display-properties">
  <div className="dp-monitor" aria-hidden="true"><div className="dp-preview" style={{background:scenes[resolveWallpaper(pick,state.profile.themeId)].prev}}/></div>
  <p className="dp-label" id="dp-label">Wallpaper:</p>
  <div className="dp-list" role="radiogroup" aria-labelledby="dp-label">{wallpaperIds.map(id=><button key={id} role="radio" aria-checked={pick===id} className={pick===id?'selected':''} onClick={()=>setPick(id)} onDoubleClick={async()=>{if(await run({type:'profile',input:{wallpaper:id}}))onClose();}}>{scenes[id].label}{id==='auto'&&` → ${scenes[seasonScene[state.profile.themeId]].label}`}</button>)}</div>
  <div className="dp-buttons"><button className="button" disabled={busy} onClick={async()=>{if(await apply())onClose();}}>OK</button><button className="button" onClick={onClose}>CANCEL</button><button className="button" disabled={busy} onClick={()=>void apply()}>APPLY</button></div>
 </div></Modal>;}
