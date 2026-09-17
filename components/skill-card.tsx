'use client';
import Link from 'next/link';
import {Check,Lock,Star,ArrowRight,Clock,BookOpen} from 'lucide-react';
import type {SkillNode} from '@/lib/content';
export const stateIcons={locked:Lock,available:BookOpen,in_progress:Clock,completed:Check,mastered:Star};
export function SkillCard({node,status,compact=false}:{node:SkillNode;status:string;compact?:boolean}){const Icon=stateIcons[status as keyof typeof stateIcons]||BookOpen;return <Link href={`/hobbies/${node.hobbyId}/nodes/${node.id}`} className={`skill-card ${status} ${compact?'compact':''} ${node.id.endsWith('-start')?'entry-node':''}`} data-tier={node.tier} data-status={status}><span className="node-icon"><Icon size={20}/></span><div><span className="node-kind">{node.nodeType} · {node.xpReward} XP</span>{node.id.endsWith('-start')&&<b className="get-started">GET STARTED</b>}<strong>{node.title}</strong><span className="difficulty-label">{node.tier==='start'?'beginner · orientation':node.tier}</span><small>{status.replace('_',' ')}</small></div>{!compact&&<ArrowRight size={17}/>}</Link>;}
