'use client';
import {useState} from 'react';
import Link from 'next/link';
import {SpriteAvatar} from './sprite-avatar';
import {Closet} from './screens';
import {useGame} from './provider';
import {spriteSlots,type AnimationTag} from '@/lib/sprites';
export function AppearanceEditor({slot='top'}:{slot?:string}){const {state}=useGame();const [facing,setFacing]=useState<'right'|'left'>('right');const [animation,setAnimation]=useState<AnimationTag>('idle');const category=spriteSlots.some(([s])=>s===slot)?slot:'top';return <section className="appearance-editor"><header><Link className="back-link" href="/loadout">← Real-world gear</Link><h1>APPEARANCE</h1><p>Wear what feels like you. Hobby rewards unlock through practice.</p></header><div className="appearance-layout"><div className="appearance-preview"><SpriteAvatar selection={state.avatar} flip={facing==='left'} animation={animation}/><div className="pose-choices" role="group" aria-label="Character view">{(['right','left'] as const).map(p=><button key={p} className="button" aria-pressed={facing===p} onClick={()=>setFacing(p)}>face {p}</button>)}</div><div className="pose-choices" role="group" aria-label="Preview animation">{(['idle','walk','action'] as const).map(a=><button className="button" key={a} aria-pressed={animation===a} onClick={()=>setAnimation(a)}>{a}</button>)}</div></div><div><Closet key={category} initialSlot={category}/></div></div></section>;}
