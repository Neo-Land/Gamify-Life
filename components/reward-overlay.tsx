'use client';
import {useEffect,useState} from 'react';
import {PixelSprite} from './pixel-sprite';
import {useGame} from './provider';
import type {RewardEvent} from '@/lib/rewards';
/** The reward moment. Node completion has its own summary dialog, so the provider does not raise a
 * toast for it; everything else that earns XP — practice, quests, achievements, every level-up —
 * had no feedback at all before this. */
export function RewardOverlay(){
 const {reward,clearReward}=useGame();
 const [leaving,setLeaving]=useState(false);
 const id=reward?.id??null,big=!!(reward?.lifeLevel||reward?.hobbyLevelUps.length);
 useEffect(()=>{if(!id)return;setLeaving(false);
  const hide=setTimeout(()=>setLeaving(true),big?6200:4200);
  const drop=setTimeout(()=>clearReward(),big?6800:4800);
  return()=>{clearTimeout(hide);clearTimeout(drop);};},[id,big,clearReward]);
 if(!reward)return null;
 return <div className="reward-toast" data-leaving={leaving||undefined} data-level={big||undefined} role="status" aria-live="polite">
  <p className="reward-title" aria-hidden="true"><PixelSprite name={big?'star':'warning'} size={16}/>{big?'LEVEL UP!':reward.achievements.length?'ACHIEVEMENT UNLOCKED!':'NICE WORK!'}</p>
  <button className="reward-dismiss" aria-label="Dismiss reward" onClick={clearReward}><PixelSprite name="close" size={16}/></button>
  {reward.xp>0&&<p className="reward-xp">+{reward.xp} XP</p>}
  {reward.sources.map((s:string)=><p className="reward-source" key={s}>{s}</p>)}
  {reward.lifeLevel!==null&&<p className="reward-level">✦ Life level {reward.lifeLevel}</p>}
  {reward.hobbyLevelUps.map((h:RewardEvent['hobbyLevelUps'][number])=><p className="reward-level" key={h.hobbyId}>✦ {h.name} level {h.level} · {h.levelName}</p>)}
  {reward.achievements.map((a:string)=><p className="reward-unlock" key={a}>Achievement · {a}</p>)}
  {reward.cosmetics.map((c:string)=><p className="reward-unlock" key={c}>New cosmetic · {c}</p>)}
 </div>;
}
