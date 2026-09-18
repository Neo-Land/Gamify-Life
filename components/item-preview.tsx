'use client';
import type {ReactNode} from 'react';
import {Avatar} from './avatar';
import type {State} from '@/lib/domain';
/** Closet thumbnails render the item on the player's own character, cropped to the region it affects.
 * Values are viewBox windows in authored canvas units, after the chibi head/body scaling. */
const head='52 26 152 190',torso='74 194 108 114';
const crops:Record<string,string>={body:head,hair:head,hairColor:head,face:head,headwear:'44 10 168 200',faceAccessory:head,top:torso,outerwear:'68 176 120 140',bottoms:'76 256 104 112',shoes:'76 316 104 62',backItem:'64 180 128 140',accessory:'72 160 112 120',prop:'116 196 140 180'};
export function ItemPreview({slot,itemId,state,children}:{slot:string;itemId:string;state:State;children?:ReactNode}){
 return <span className="swatch preview"><Avatar bodyRigId={state.profile.bodyRigId} selection={{...state.avatar,[slot]:itemId}} viewBox={crops[slot]||'0 0 256 384'} decorative/>{children&&<span className="swatch-badge">{children}</span>}</span>;
}
