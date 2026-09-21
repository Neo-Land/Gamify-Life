import {achievements,avatarItems,hobbies} from './content';
import {hobbyLevel,hobbyXp,levelNames,lifeLevel,lifeXp} from './progression';
import type {CompletionResult,State} from './domain';
/** What a single command earned, in the shape the UI celebrates it.
 * `applyCommand` has always returned XP, unlocks and new cosmetics; nothing consumed them.
 * Level-ups are not in that result, so they are derived by comparing the two states. */
export type RewardEvent={
 id:string;xp:number;sources:string[];
 lifeLevel:number|null;
 hobbyLevelUps:{hobbyId:string;name:string;level:number;levelName:string}[];
 achievements:string[];cosmetics:string[];
};
export function rewardFor(before:State,after:State,result:CompletionResult):RewardEvent|null{
 const known=new Set(before.ledger.map(l=>l.id));
 const fresh=after.ledger.filter(l=>!known.has(l.id));
 const beforeLife=lifeLevel(lifeXp(before)),afterLife=lifeLevel(lifeXp(after));
 const hobbyLevelUps=hobbies.flatMap(h=>{const from=hobbyLevel(hobbyXp(before,h.id)),to=hobbyLevel(hobbyXp(after,h.id));
  return to>from?[{hobbyId:h.id,name:h.name,level:to,levelName:levelNames[to]}]:[];});
 const unlockedAchievements=result.newAchievementIds.flatMap(id=>{const a=achievements.find(a=>a.id===id);return a?[a.name]:[];});
 const cosmetics=result.newAvatarItemIds.flatMap(id=>{const i=avatarItems.find(i=>i.id===id);return i?[i.name]:[];});
 if(!result.xpAwarded&&afterLife<=beforeLife&&!hobbyLevelUps.length&&!unlockedAchievements.length&&!cosmetics.length)return null;
 return {
  id:`${after.ledger.length}:${result.xpAwarded}:${afterLife}:${unlockedAchievements.length}:${cosmetics.length}`,
  xp:result.xpAwarded,sources:fresh.map(l=>l.source),
  lifeLevel:afterLife>beforeLife?afterLife:null,
  hobbyLevelUps,achievements:unlockedAchievements,cosmetics};
}
