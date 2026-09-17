'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Avatar,type AvatarPose} from './avatar';
import {Closet} from './screens';
import {useGame} from './provider';
import {avatarSlots} from '@/lib/wardrobe';
export function AppearanceEditor({slot='top'}:{slot?:string}){const {state}=useGame();const [pose,setPose]=useState<AvatarPose>('front');const category=avatarSlots.some(([s])=>s===slot)?slot:'top';return <section className="appearance-editor"><header><Link className="back-link" href="/loadout">← Real-world gear</Link><h1>APPEARANCE</h1><p>Wear what feels like you. Hobby rewards unlock through practice.</p></header><div className="appearance-layout"><div className="appearance-preview"><Avatar selection={state.avatar} pose={pose} large/><div className="pose-choices" role="group" aria-label="Character view">{(['front','left','right','back'] as const).map(p=><button key={p} className="button" aria-pressed={pose===p} onClick={()=>setPose(p)}>{p}</button>)}</div></div><Closet key={category} initialSlot={category}/></div></section>;}
