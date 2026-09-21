import {extraWardrobe} from './wardrobe';
import { z } from 'zod';
import rawNodes from '@/content/nodes.json';
import rawHobbies from '@/content/hobbies.json';
import rawGear from '@/content/gear.json';
import { lessons } from '@/content/lessons';
export const hobbySchema = z.object({id:z.string(),name:z.string(),icon:z.string(),color:z.string(),description:z.string(),prefix:z.string().length(3),safetyNote:z.string(),resources:z.array(z.object({title:z.string(),url:z.string().url(),placeholder:z.boolean().default(true),checkedAt:z.string().optional()})).min(1),practicePrerequisites:z.array(z.string()),startSummary:z.string(),upgrade:z.object({low:z.number().int(),high:z.number().int(),note:z.string()})});
export const hobbies = z.array(hobbySchema).parse(rawHobbies);
/** Kept as a tuple for z.enum, and checked against the JSON at module load so the two cannot drift. */
export const hobbyIds = ['tennis','cycling','swimming','journaling','pc-building','drawing','painting','running','volleyball','reading'] as const;
if(hobbies.length!==hobbyIds.length||hobbies.some(h=>!(hobbyIds as readonly string[]).includes(h.id)))throw new Error('hobbies.json and hobbyIds are out of sync');
if(new Set(hobbies.map(h=>h.prefix)).size!==hobbies.length)throw new Error('hobby prefixes must be unique');
export const hobbyById=(id:string)=>hobbies.find(h=>h.id===id);
export const nodeSchema = z.object({id:z.string(),hobbyId:z.enum(hobbyIds),slug:z.string(),title:z.string(),tier:z.enum(['start','beginner','intermediate','advanced']),nodeType:z.string(),xpReward:z.number().int().nonnegative(),requires:z.array(z.string()),orGroups:z.array(z.array(z.string())),completion:z.object({prompt:z.string(),evidenceMode:z.enum(['honor','count','duration','note']),targetValue:z.number().optional(),targetUnit:z.string().optional()}),estimatedMinutes:z.number(),isRequired:z.boolean(),isSafetyCritical:z.boolean(),isRecommended:z.boolean(),status:z.enum(['published','draft','archived']),contentVersion:z.number(),sortOrder:z.number(),tags:z.array(z.string()),category:z.string(),position:z.object({x:z.number(),y:z.number()})});
export const nodes = rawNodes.map(raw => {
 const n = nodeSchema.parse(raw); const [why,steps,mistake]=lessons[n.id].split('|');
 const hobby = hobbyById(n.hobbyId)!; const safety = hobby.safetyNote;
 return {...n,shortDescription:why,whyItMatters:why,instructions:steps.split(';'),learningObjectives:[steps.split(';')[0],n.completion.prompt,'Recognize and avoid the common mistake below.'],commonMistakes:[mistake],safetyNotes:safety?[safety]:[],mastery:{prompt:'Repeat this challenge on three separate days and describe what became more consistent.',evidenceMode:'note' as const},masteryXpReward:15,review_status:'draft',last_reviewed_at:null,resources:hobby.resources};
});
export type SkillNode = typeof nodes[number];
export const nodeById=(id:string)=>nodes.find(n=>n.id===id);
export const tiers=['start','beginner','intermediate','advanced'];
/** Conservative entry-level or used ranges, not the cheapest thing that exists and not a good one.
 * Surfaced as estimates, never as prices. `borrowable` is true only where borrowing is realistic and
 * safe, which is why helmets, goggles and running shoes are false however easy they are to hand over. */
export const pricesCheckedAt='2026-09';
export const gearSchema=z.object({id:z.string(),hobbyId:z.enum(hobbyIds),name:z.string(),necessity:z.enum(['required','recommended','optional','not_needed']),guidance:z.string(),cost:z.object({low:z.number().int().nonnegative(),high:z.number().int().nonnegative(),currency:z.literal('USD')}),borrowable:z.boolean(),usedOk:z.boolean(),freeAlternative:z.string().optional()});
export const gear=z.array(gearSchema).parse(rawGear);
export type GearItem=typeof gear[number];
/** `low` is what it costs if you borrow everything borrowable, so a hobby that can be started for
 * nothing shows zero. `high` is the buy-it-all-new ceiling. */
/** Whole US dollars with thousands separators: `$1,580`, and a range as `$629–$1,580`. */
export const usd=(n:number)=>`$${n.toLocaleString('en-US')}`;
export const usdRange=(low:number,high:number)=>low===high?usd(low):`${usd(low)}–${usd(high)}`;
export function startupCost(hobbyId:string){
 const required=(gear as GearItem[]).filter(g=>g.hobbyId===hobbyId&&g.necessity==='required');
 const low=required.reduce((a,g)=>a+(g.borrowable?0:g.cost.low),0);
 const high=required.reduce((a,g)=>a+g.cost.high,0);
 const borrowedPath=required.every(g=>g.borrowable||g.cost.high===0);
 return {low,high,borrowedPath,tier:low===0?'free':low<40?'low':low<150?'moderate':'higher'} as const;
}
/** Cheapest first, so the hobbies you can start for nothing lead the list. Stable within a price. */
export const byStartupCost=<T extends {id:string}>(list:readonly T[])=>list.map((h,i)=>({h,i,c:startupCost(h.id)})).sort((a,b)=>a.c.low-b.c.low||a.c.high-b.c.high||a.i-b.i).map(x=>x.h);
/** One line, text-carried: colour is decoration, never the meaning. */
export function costBadge(hobbyId:string){
 const c=startupCost(hobbyId);
 if(c.high===0)return 'FREE TO TRY';
 const money=usdRange(c.low,c.high);
 if(c.low===0)return c.borrowedPath?`FREE TO TRY · CAN BORROW`:`FREE TO TRY · UP TO ${usd(c.high)}`;
 return c.borrowedPath?`${money} · CAN BORROW`:`${money} TO START`;
}
export const quests=[
 {id:'tennis-session',hobbyId:'tennis',title:'A little court time',description:'Complete one 20-minute court or wall session.',target:20,unit:'minutes',xp:60,requires:['ten-gear','ten-safety'],period:'week',max:1},
 {id:'cycling-checks',hobbyId:'cycling',title:'Good rides start here',description:'Perform two ABC pre-ride checks.',target:2,unit:'checks',xp:40,requires:['cyc-check'],period:'week',max:1},
 {id:'swimming-sessions',hobbyId:'swimming',title:'Find your flow',description:'Complete two supervised technique sessions.',target:2,unit:'sessions',xp:75,requires:['swi-safety'],period:'week',max:1},
 {id:'journaling-week',hobbyId:'journaling',title:'A few words for yourself',description:'Write three entries this week.',target:3,unit:'entries',xp:60,requires:['jou-tools'],period:'week',max:1},
 {id:'pc-building-sessions',hobbyId:'pc-building',title:'Hands on the hardware',description:'Complete two build or diagnosis sessions.',target:2,unit:'sessions',xp:60,requires:['pcb-safety'],period:'week',max:1},
 {id:'drawing-pages',hobbyId:'drawing',title:'Fill the page',description:'Fill three practice pages.',target:3,unit:'pages',xp:50,requires:['drw-gear'],period:'week',max:1},
 {id:'painting-studies',hobbyId:'painting',title:'Two small studies',description:'Complete two painting studies.',target:2,unit:'studies',xp:60,requires:['pnt-safety'],period:'week',max:1},
 {id:'running-outings',hobbyId:'running',title:'Three times out',description:'Run on three separate days.',target:3,unit:'runs',xp:70,requires:['run-safety'],period:'week',max:1},
 {id:'volleyball-sessions',hobbyId:'volleyball',title:'Get on court',description:'Play two sessions.',target:2,unit:'sessions',xp:70,requires:['vol-safety'],period:'week',max:1},
 {id:'reading-days',hobbyId:'reading',title:'Most days',description:'Read on five separate days.',target:5,unit:'days',xp:50,requires:['rdg-gear'],period:'week',max:1}
];
export const achievements=[
 {id:'first-step',name:'First Step',description:'Complete your first skill.',xp:25,icon:'✦'},
 {id:'curious-mind',name:'Curious Mind',description:'Enroll in three hobbies.',xp:0,icon:'✿'},
 {id:'real-world',name:'Real-World Action',description:'Complete your first practice skill.',xp:50,icon:'↗'},
 {id:'well-rounded',name:'Well Rounded',description:'Reach level 2 in two hobbies.',xp:0,icon:'◈'},
 {id:'renaissance',name:'Renaissance Beginner',description:'Reach level 2 in three hobbies.',xp:0,icon:'☀'},
 {id:'ten-sessions',name:'Ten Sessions',description:'Log ten practice sessions.',xp:100,icon:'▤'}
];
export const avatarItems=[
 ...extraWardrobe,
 ...['sand','warm','bronze','umber','deep','rose'].map((id,i)=>({id:`skin-${id}`,name:id,slot:'body',color:['#F1CEAA','#DCAE83','#BD825A','#935F42','#604333','#ECC4B6'][i],level:0})),
 ...['crop','curls','coils','long','bald','braids','bun','sidepart'].map(id=>({id:`hair-${id}`,name:id,slot:'hair',color:'#594638',level:0})),
 ...['espresso','chestnut','gold','silver','copper','ink'].map((id,i)=>({id:`color-${id}`,name:id,slot:'hairColor',color:['#3F342F','#805838','#C8A15B','#CAC4B9','#AE694A','#252A33'][i],level:0})),
 ...['sage','rose','ochre','navy','cream','plum'].map((id,i)=>({id:`top-${id}`,name:`${id} shirt`,slot:'top',color:['#819776','#D98C8C','#D6B65C','#596978','#F4EBDD','#8E6C98'][i],level:0})),
 ...['olive','denim','clay','charcoal','cream'].map((id,i)=>({id:`bottom-${id}`,name:`${id} trousers`,slot:'bottoms',color:['#626F54','#617C89','#A77D69','#484A48','#D5C9A5'][i],level:0})),
 ...['cream','brown','navy','rose'].map((id,i)=>({id:`shoe-${id}`,name:`${id} sneakers`,slot:'shoes',color:['#F4EBDD','#76634E','#445B6D','#BD7979'][i],level:0})),
 ...['bright','calm','freckles'].map(id=>({id:`face-${id}`,name:id,slot:'face',color:'#BD8662',level:0})),
 ...['glasses','cap','backpack'].map((id,i)=>({id,name:id,slot:'accessory',color:['#414A42','#8B9F8C','#B0905F'][i],level:0})),
 {id:'none',name:'No accessory',slot:'accessory',color:'transparent',level:0},
 {id:'visor',name:'Mint visor',slot:'accessory',color:'#8FBA9C',level:2,hobbyId:'tennis'},
 {id:'helmet',name:'Pastel helmet',slot:'accessory',color:'#D6B65C',level:2,hobbyId:'cycling'},
 {id:'goggles',name:'Teal goggles',slot:'accessory',color:'#72B7A4',level:2,hobbyId:'swimming'},
 {id:'satchel',name:'Ochre satchel',slot:'accessory',color:'#C98945',level:2,hobbyId:'journaling'},
 {id:'rounded-pin',name:'Well Rounded pin',slot:'accessory',color:'#AE9BC8',level:0,achievement:'well-rounded'},
 {id:'mac-sweater',name:'Macintosh sweatshirt',slot:'top',color:'#EFE1C8',level:5},
 {id:'renaissance-sweater',name:'Renaissance sweater',slot:'top',color:'#D1C2DE',level:0,achievement:'renaissance'},
 {id:'prop-quill',name:'Large feather quill',slot:'prop',color:'#EEE3BF',level:0,rewardNode:'jou-review'},
 {id:'prop-pen-sword',name:'Fountain-pen sword',slot:'prop',color:'#A996C5',level:0,rewardNode:'jou-90'},
 {id:'prop-toolbelt',name:'Bike-tool belt',slot:'prop',color:'#B89350',level:0,rewardNode:'cyc-route'},
 {id:'prop-water-trail',name:'Water-droplet trail',slot:'prop',color:'#70AFA5',level:0,rewardNode:'swi-endurance'},
 {id:'prop-ball',name:'Ball companion',slot:'prop',color:'#D2B95B',level:0,rewardNode:'ten-consistency'},
 ...['none','racquet','notebook'].map(id=>({id:`prop-${id}`,name:id==='none'?'No prop':id,slot:'prop',color:'#C98945',level:0}))
];
