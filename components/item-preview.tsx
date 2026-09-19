'use client';
import type {ReactNode} from 'react';
import {Avatar} from './avatar';
import type {State} from '@/lib/domain';
/** Closet thumbnails render the item on the player's own character, cropped to the region it affects.
 * Values are viewBox windows in authored canvas units, after the chibi head/body scaling. */
const head='36 14 184 230',crown='0 0 256 206',torso='68 248 120 76';
const crops:Record<string,string>={body:head,hair:crown,hairColor:crown,face:head,eyeColor:'50 112 158 78',headwear:crown,faceAccessory:'30 104 196 96',top:torso,outerwear:'66 250 124 86',bottoms:'82 300 92 56',shoes:'74 336 108 34',backItem:'78 252 132 72',accessory:'92 248 72 46',prop:'148 238 94 84'};
export function ItemPreview({slot,itemId,state,children}:{slot:string;itemId:string;state:State;children?:ReactNode}){
 return <span className="swatch preview"><Avatar bodyRigId={state.profile.bodyRigId} selection={{...state.avatar,[slot]:itemId}} viewBox={crops[slot]||'0 0 256 384'} decorative/>{children&&<span className="swatch-badge">{children}</span>}</span>;
}
