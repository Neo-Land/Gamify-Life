'use client';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import {PixelSprite} from './pixel-sprite';
import {hobbies} from '@/lib/content';
import type {SkillNode} from '@/lib/content';
export const stateIcons={locked:'lock',available:'book',in_progress:'hourglass',completed:'check',mastered:'star'};
/** `onSelect` turns the card into a button: inside the tree a node opens a panel on the same page
 * rather than navigating away. Without it the card stays a link, so every other caller is unchanged. */
export function SkillCard({node,status,compact=false,suggested=false,onSelect}:{node:SkillNode;status:string;compact?:boolean;suggested?:boolean;onSelect?:(id:string)=>void}){
 const className=`skill-card ${status} ${compact?'compact':''} ${node.id.endsWith('-start')?'entry-node':''} ${suggested?'suggested':''}`;
 const inner=<><span className="node-icon"><PixelSprite name={stateIcons[status as keyof typeof stateIcons]||'book'} size={20}/></span><div><span className="node-kind">{node.nodeType} · {node.xpReward} XP</span>{node.id.endsWith('-start')&&<b className="get-started">GET STARTED</b>}{suggested&&!node.id.endsWith('-start')&&<b className="get-started">SUGGESTED START</b>}<strong>{node.title}</strong><span className="difficulty-label">{node.tier==='start'?'beginner · orientation':node.tier}</span><small>{status.replace('_',' ')}</small></div>{!compact&&<PixelSprite name="next" size={16}/>}</>;
 const attrs={className,style:{'--hobby':hobbies.find(h=>h.id===node.hobbyId)?.color} as CSSProperties,'data-tier':node.tier,'data-status':status,'data-suggested':suggested||undefined};
 return onSelect
  ?<button type="button" {...attrs} onClick={()=>onSelect(node.id)}>{inner}</button>
  :<Link href={`/hobbies/${node.hobbyId}/nodes/${node.id}`} {...attrs}>{inner}</Link>;}
