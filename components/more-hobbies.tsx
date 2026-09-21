'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useGame} from './provider';
import {costBadge,pricesCheckedAt} from '@/lib/content';
import {otherHobbies} from '@/lib/progression';
/** Hobbies you haven't chosen stay folded away until you ask for them. */
export function MoreHobbies(){const {state,run,busy}=useGame();const router=useRouter();const [browsing,setBrowsing]=useState(false);const more=otherHobbies(state);if(!more.length)return null;return <section className="more-hobbies">{browsing
 ?<><div className="row"><h2>Start something new</h2><button className="text-button" onClick={()=>setBrowsing(false)}>Close</button></div>
  <p className="metadata">Costs are estimates, checked {pricesCheckedAt}. Borrowing counts.</p>
  <div className="onboarding-choices">{more.map(h=><button key={h.id} disabled={busy} onClick={async()=>{if(await run({type:'enroll',hobbyIds:[h.id as typeof state.enrollments[number]]}))router.push(`/hobbies/${h.id}`);}}><span>{h.icon}</span><strong>{h.name}</strong><small>{h.description}</small><small>{costBadge(h.id)}</small></button>)}</div></>
 :<button className="button full" onClick={()=>setBrowsing(true)}>START A NEW HOBBY · {more.length} more to try</button>}</section>;}
