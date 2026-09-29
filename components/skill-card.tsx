'use client';
import Link from 'next/link';
import {Check,Lock,Star,ArrowRight,Clock,BookOpen} from 'lucide-react';
import type {SkillNode} from '@/lib/content';
export const stateIcons={locked:Lock,available:BookOpen,in_progress:Clock,completed:Check,mastered:Star};
/** `onSelect` turns the card into a button: inside the tree a node opens a panel on the same page
 * rather than navigating away. Without it the card stays a link, so every other caller is unchanged. */
export function SkillCard({node,status,compact=false,suggested=false,onSelect}:{node:SkillNode;status:string;compact?:boolean;suggested?:boolean;onSelect?:(id:string)=>void}){
 const Icon=stateIcons[status as keyof typeof stateIcons]||BookOpen;
 const className=`skill-card ${status} ${compact?'compact':''} ${node.id.endsWith('-start')?'entry-node':''} ${suggested?'suggested':''}`;
 const inner=<><span className="node-icon"><Icon size={20}/></span><div><span className="node-kind">{node.nodeType} · {node.xpReward} XP</span>{node.id.endsWith('-start')&&<b className="get-started">GET STARTED</b>}{suggested&&!node.id.endsWith('-start')&&<b className="get-started">SUGGESTED START</b>}<strong>{node.title}</strong><span className="difficulty-label">{node.tier==='start'?'beginner · orientation':node.tier}</span><small>{status.replace('_',' ')}</small></div>{!compact&&<ArrowRight size={17}/>}</>;
 const attrs={className,'data-tier':node.tier,'data-status':status,'data-suggested':suggested||undefined};
 return onSelect
  ?<button type="button" {...attrs} onClick={()=>onSelect(node.id)}>{inner}</button>
  :<Link href={`/hobbies/${node.hobbyId}/nodes/${node.id}`} {...attrs}>{inner}</Link>;}
