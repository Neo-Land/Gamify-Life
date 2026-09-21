import { achievements, avatarItems, gear, hobbyById, hobbyIds, nodeById, nodes, quests, tiers, type SkillNode } from './content';
import { commandSchema, type Command, type CompletionResult, type State } from './domain';
export const thresholds=[0,100,300,650,1100,1700,2500,3500,4800,6400,8500];
export const levelNames=['Curious','Newcomer','Beginner','Capable Beginner','Recreational','Developing','Skilled','Experienced','Advanced','Specialist','Mentor'];
export const hobbyLevel=(xp:number)=>Math.max(0,thresholds.findLastIndex(t=>xp>=t));
export const lifeLevel=(xp:number)=>Math.floor(Math.sqrt(Math.max(0,xp)/250))+1;
export const hobbyXp=(s:State,id:string)=>s.ledger.filter(l=>l.hobbyId===id).reduce((a,l)=>a+l.amount,0);
export const lifeXp=(s:State)=>s.ledger.reduce((a,l)=>a+l.amount,0);
export const done=(s:State,id:string)=>['completed','mastered'].includes(s.progress[id]?.status);
export function practicePrerequisites(hobbyId:string):string[]{return hobbyById(hobbyId)?.practicePrerequisites||[];}
export function safetyRequirements(n:SkillNode):string[]{
 if(n.hobbyId==='swimming'&&!['orientation','gear'].includes(n.nodeType))return ['swi-safety'];
 if(n.hobbyId==='cycling'&&['practice','challenge','milestone','specialization'].includes(n.nodeType))return ['cyc-safety','cyc-check'];
 return [];
}
export function unmet(n:SkillNode,s:State){return [...new Set([...n.requires,...safetyRequirements(n)])].filter(id=>!done(s,id));}
export function available(n:SkillNode,s:State){return n.status==='published'&&!done(s,n.id)&&unmet(n,s).length===0&&n.orGroups.every(g=>g.some(id=>done(s,id)));}
export function nodeStatus(n:SkillNode,s:State):'locked'|'available'|'in_progress'|'completed'|'mastered'{if(done(s,n.id))return s.progress[n.id].status;return available(n,s)?s.progress[n.id]?.status||'available':'locked';}
export function period(date=new Date()){const d=new Date(date);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10);}
export function questState(s:State,id:string,date=new Date()){const q=s.quests[id];return q?.period===period(date)?q:{pinned:false,value:0,completed:false,period:period(date)};}
export function recommend(s:State):SkillNode|undefined {
 const pool=nodes.filter(n=>s.enrollments.includes(n.hobbyId)&&available(n,s));
 const pinned=quests.filter(q=>questState(s,q.id).pinned&&!questState(s,q.id).completed);
 const rank=(n:SkillNode)=>pinned.some(q=>q.hobbyId===n.hobbyId)?0:s.progress[n.id]?.status==='in_progress'?1:n.isRequired?2+tiers.indexOf(n.tier):n.isRecommended?6:7;
 pool.sort((a,b)=>rank(a)-rank(b)||a.estimatedMinutes-b.estimatedMinutes||a.sortOrder-b.sortOrder);
 if(s.recommendation.visits>=3&&pool[0]?.id===s.recommendation.id){const alternative=pool.find(n=>n.id!==pool[0].id&&rank(n)===rank(pool[0]));if(alternative)return alternative;}
 return pool[0];
}
export function avatarUnlocked(item:typeof avatarItems[number],s:State){if('rewardNode' in item&&item.rewardNode)return done(s,item.rewardNode);if('achievement' in item&&item.achievement)return s.achievements.includes(item.achievement);if('hobbyId' in item&&item.hobbyId)return hobbyLevel(hobbyXp(s,item.hobbyId))>=item.level;return item.level===0||lifeLevel(lifeXp(s))>=item.level;}
export function stats(s:State){return Object.fromEntries(['Athletics','Creativity','Knowledge','Practical','Wellness'].map(tag=>[tag,nodes.filter(n=>done(s,n.id)&&(n.tags.includes(tag)||(tag==='Practical'&&['gear','maintenance'].includes(n.nodeType)))).reduce((a,n)=>a+n.xpReward,0)]));}
export function applyCommand(current:State,input:Command,now=new Date()):CompletionResult{
 const c=commandSchema.parse(input);const s=structuredClone(current);const at=now.toISOString();
 const beforeXp=lifeXp(s);const beforeAvailable=nodes.filter(n=>available(n,s)).map(n=>n.id);const beforeItems=avatarItems.filter(i=>avatarUnlocked(i,s)).map(i=>i.id);
 const event=(id:string,text:string,xp=0)=>{if(!s.activity.some(e=>e.id===id))s.activity.unshift({id,text,xp,at});};
 const award=(id:string,hobbyId:string|null,amount:number,source:string)=>{if(s.ledger.some(l=>l.id===id))return;s.ledger.push({id,hobbyId,amount,source,at});event(id,source,amount);};
 const getNode=(id:string)=>{const n=nodeById(id);if(!n||n.status!=='published')throw new Error('This skill is not available.');return n;};
 const requireAvailable=(n:SkillNode)=>{if(!available(n,s))throw new Error('Complete the required prerequisites and safety steps first.');};
 if(c.type==='plan'){const index=s.plans.findIndex(p=>p.id===c.plan.id);if(index<0)s.plans.push(c.plan);else s.plans[index]=c.plan;}
 if(c.type==='cancel-plan')s.plans=s.plans.filter(p=>p.id!==c.id);
 if(c.type==='pause-hobby')s.enrollments=s.enrollments.filter(h=>h!==c.hobbyId);
 if(c.type==='window')s.windows[c.window.appId]=c.window;
 if(c.type==='layout-reset')s.windows={};
 if(c.type==='profile')s.profile={...s.profile,...c.input};
 if(c.type==='enroll')s.enrollments=[...new Set([...s.enrollments,...c.hobbyIds])];
 if(c.type==='start'){const n=getNode(c.nodeId);if(!done(s,n.id)){requireAvailable(n);s.progress[n.id]??={status:'in_progress',startedAt:at};if(!s.enrollments.includes(n.hobbyId))s.enrollments.push(n.hobbyId);}}
 if(c.type==='complete'||c.type==='master'){
  const n=getNode(c.nodeId);const key=`${n.id}:${c.type}`;
  if(!s.ledger.some(l=>l.id===key)){
   if(c.type==='complete')requireAvailable(n);else if(!done(s,n.id))throw new Error('Complete the basic challenge before mastery.');
   if(!c.evidence.confirmed)throw new Error('Confirm that you completed the real-world challenge.');
   if(c.type==='master'&&!c.evidence.note.trim())throw new Error('Describe your three separate practice days.');
   if(c.type==='complete'&&n.completion.evidenceMode==='note'&&!c.evidence.note.trim())throw new Error('Add a short note for this challenge.');
   if(c.type==='complete'&&n.completion.targetValue&&(c.evidence.value??0)<n.completion.targetValue)throw new Error(`Record at least ${n.completion.targetValue} ${n.completion.targetUnit}.`);
   if(n.id==='ten-gear'&&c.type==='complete'&&!['tennis-0','tennis-1'].every(id=>s.gear[id]==='owned'))throw new Error('Record your owned or borrowed racquet and balls in Loadout first.');
   s.progress[n.id]={...s.progress[n.id],status:c.type==='master'?'mastered':'completed',startedAt:s.progress[n.id]?.startedAt||at,completedAt:s.progress[n.id]?.completedAt||at,...(c.type==='master'?{masteredAt:at}:{}),evidence:c.evidence,contentVersion:n.contentVersion};
   if(!s.enrollments.includes(n.hobbyId))s.enrollments.push(n.hobbyId);
   award(key,n.hobbyId,c.type==='master'?n.masteryXpReward:n.xpReward,`${c.type==='master'?'Mastered':'Completed'} ${n.title}`);
  }
 }
 if(c.type==='pin'||c.type==='quest'){
  const q=quests.find(q=>q.id===c.questId);if(!q)throw new Error('Quest not found.');
  if(!q.requires.every(id=>done(s,id)))throw new Error('Finish this quest’s prerequisites first.');
  const entry=questState(s,q.id,now);s.quests[q.id]=entry;
  if(c.type==='pin'){if(c.pinned&&!entry.pinned&&quests.filter(q=>questState(s,q.id,now).pinned&&!questState(s,q.id,now).completed).length>=3)throw new Error('Keep at most three quests pinned.');entry.pinned=c.pinned;}
  else if(!entry.completed){entry.value=Math.min(q.target,entry.value+c.delta);if(entry.value>=q.target){entry.completed=true;entry.pinned=false;award(`quest:${q.id}:${period(now)}`,q.hobbyId,q.xp,`Quest complete: ${q.title}`);}}
 }
 if(c.type==='practice'){
  const missing=practicePrerequisites(c.hobbyId).filter(id=>!done(s,id));
  if(missing.length)throw new Error(`Before logging practice, complete: ${missing.map(id=>nodeById(id)!.title).join(', ')}.`);
  if(c.nodeId){const n=getNode(c.nodeId);if(n.hobbyId!==c.hobbyId||(!done(s,n.id)&&!available(n,s)))throw new Error('Choose an unlocked skill for this hobby.');}
  if(!s.practice.some(p=>p.id===c.id)){s.practice.push({id:c.id,hobbyId:c.hobbyId,nodeId:c.nodeId,duration:c.duration,note:c.note,at});const key=`practice:${c.hobbyId}:${at.slice(0,10)}`;award(key,c.hobbyId,20,'Practice session');event(c.id,`${c.duration} minutes of ${c.hobbyId} practice`);}
 }
 if(c.type==='gear'){if(!gear.some(g=>g.id===c.gearId))throw new Error('Gear item not found.');s.gear[c.gearId]=c.status;}
 if(c.type==='avatar'){const item=avatarItems.find(i=>i.id===c.itemId&&i.slot===c.slot);if(!item||!avatarUnlocked(item,s))throw new Error('This cosmetic has not unlocked yet.');s.avatar[c.slot]=c.itemId;}
 if(c.type==='avatar-preset'){for(const [slot,itemId] of Object.entries(c.items)){const item=avatarItems.find(i=>i.id===itemId&&i.slot===slot);if(!item||!avatarUnlocked(item,s))throw new Error('This cosmetic has not unlocked yet.');s.avatar[slot]=itemId;}}
 if(c.type==='visit'){const n=recommend(s);if(n)s.recommendation={id:n.id,visits:s.recommendation.id===n.id?s.recommendation.visits+1:1};}
 const levels=hobbyIds.map(h=>hobbyLevel(hobbyXp(s,h)));
 const earned:Record<string,boolean>={'first-step':nodes.some(n=>done(s,n.id)),'curious-mind':s.enrollments.length>=3,'real-world':nodes.some(n=>n.nodeType==='practice'&&done(s,n.id)),'well-rounded':levels.filter(l=>l>=2).length>=2,'renaissance':levels.filter(l=>l>=2).length>=3,'ten-sessions':s.practice.length>=10};
 achievements.forEach(a=>{if(earned[a.id]&&!s.achievements.includes(a.id)){s.achievements.push(a.id);award(`achievement:${a.id}`,null,a.xp,`Achievement: ${a.name}`);}});
 return {state:s,xpAwarded:lifeXp(s)-beforeXp,unlockedNodeIds:nodes.filter(n=>available(n,s)&&!beforeAvailable.includes(n.id)).map(n=>n.id),newAchievementIds:s.achievements.filter(id=>!current.achievements.includes(id)),newAvatarItemIds:avatarItems.filter(i=>avatarUnlocked(i,s)&&!beforeItems.includes(i.id)).map(i=>i.id)};
}
