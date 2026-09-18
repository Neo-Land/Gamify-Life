'use client';
import type {ReactNode} from 'react';
import {SpriteAvatar,type SpriteCrop} from './sprite-avatar';
import type {State} from '@/lib/domain';
/** Closet thumbnails render the item on the player's own character, cropped to the region it affects. */
const head:SpriteCrop={x:8,y:0,width:88,height:66},torso:SpriteCrop={x:0,y:48,width:104,height:72};
const crops:Record<string,SpriteCrop>={body:head,hair:head,hairColor:head,headwear:{x:4,y:0,width:96,height:60},faceAccessory:head,top:torso,outerwear:{x:0,y:40,width:104,height:110},backItem:torso,bottoms:{x:10,y:90,width:84,height:56},prop:{x:50,y:34,width:54,height:80}};
export function ItemPreview({slot,itemId,state,children}:{slot:string;itemId:string;state:State;children?:ReactNode}){
 return <span className="swatch preview"><SpriteAvatar selection={{...state.avatar,[slot]:itemId}} crop={crops[slot]} animation="idle" decorative/>{children&&<span className="swatch-badge">{children}</span>}</span>;
}
