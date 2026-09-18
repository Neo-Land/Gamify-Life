import {extraWardrobe,spriteWardrobe} from './wardrobe';
import { z } from 'zod';
import rawNodes from '@/content/nodes.json';
import rawHobbies from '@/content/hobbies.json';
import { lessons } from '@/content/lessons';
export const hobbyIds = ['tennis','cycling','swimming','journaling'] as const;
export const hobbies = rawHobbies;
export const nodeSchema = z.object({id:z.string(),hobbyId:z.enum(hobbyIds),slug:z.string(),title:z.string(),tier:z.enum(['start','beginner','intermediate','advanced']),nodeType:z.string(),xpReward:z.number().int().nonnegative(),requires:z.array(z.string()),orGroups:z.array(z.array(z.string())),completion:z.object({prompt:z.string(),evidenceMode:z.enum(['honor','count','duration','note']),targetValue:z.number().optional(),targetUnit:z.string().optional()}),estimatedMinutes:z.number(),isRequired:z.boolean(),isSafetyCritical:z.boolean(),isRecommended:z.boolean(),status:z.enum(['published','draft','archived']),contentVersion:z.number(),sortOrder:z.number(),tags:z.array(z.string()),category:z.string(),position:z.object({x:z.number(),y:z.number()})});
export const nodes = rawNodes.map(raw => {
 const n = nodeSchema.parse(raw); const [why,steps,mistake]=lessons[n.id].split('|');
 const safety = n.hobbyId==='swimming' ? 'Practice with qualified supervision in a swim-safe environment. Never swim alone, hyperventilate or do breath-holding contests. Restrictive knee bands are not a default freestyle correction.' : n.hobbyId==='cycling' ? 'Check air, brakes and chain before every ride. Use a fitted helmet and follow local traffic rules. Fixed-gear road use needs a functional front brake; do not learn brakeless street riding.' : n.hobbyId==='tennis' ? 'Check the court, warm up gently, keep clear of others and stop if you feel pain.' : '';
 return {...n,shortDescription:why,whyItMatters:why,instructions:steps.split(';'),learningObjectives:[steps.split(';')[0],n.completion.prompt,'Recognize and avoid the common mistake below.'],commonMistakes:[mistake],safetyNotes:safety?[safety]:[],mastery:{prompt:'Repeat this challenge on three separate days and describe what became more consistent.',evidenceMode:'note' as const},masteryXpReward:15,review_status:'draft',last_reviewed_at:null,resources:[{title:({tennis:'USTA learning resources',cycling:'League of American Bicyclists',swimming:'American Red Cross water safety',journaling:'Purdue OWL writing resources'})[n.hobbyId],url:({tennis:'https://www.usta.com/en/home/improve.html',cycling:'https://bikeleague.org/ridesmart/',swimming:'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/water-safety.html',journaling:'https://owl.purdue.edu/owl/general_writing/index.html'})[n.hobbyId],placeholder:true}]};
});
export type SkillNode = typeof nodes[number];
export const nodeById=(id:string)=>nodes.find(n=>n.id===id);
export const tiers=['start','beginner','intermediate','advanced'];
export const gear = [
 ...['Racquet','Tennis balls','Athletic shoes','Court shoes','Overgrip','Water bottle','Polyester strings','Extra expensive racquets','Tournament bag'].map((name,i)=>({id:`tennis-${i}`,hobbyId:'tennis',name,necessity:i<3?'required':i<6?'optional':'not_needed',guidance:i<3?'Borrow or use what you have; fit and condition matter.':i<6?'Optional comfort, after your first sessions.':'Wait until your playing habits give you a clear reason.'})),
 ...['Certified helmet','Lights and reflectors','Pump','Tire levers','Spare tube','Hex keys','Functional front brake'].map((name,i)=>({id:`cycling-${i}`,hobbyId:'cycling',name,necessity:i<2||i===6?'required':'recommended',guidance:i===6?'Required for this beginner road-use path, including fixed gear.':'Choose compatible, functional equipment. Ask a bike shop if uncertain.'})),
 ...['Safe swimwear','Goggles','Swim cap','Fins','Kickboard'].map((name,i)=>({id:`swimming-${i}`,hobbyId:'swimming',name,necessity:i===0?'required':'optional',guidance:i===0?'Use safe attire accepted by your pool.':'Optional; ask your instructor before using training tools.'})),
 ...['Notebook','Writing tool','Premium stationery'].map((name,i)=>({id:`journaling-${i}`,hobbyId:'journaling',name,necessity:i<2?'required':'not_needed',guidance:i<2?'Use something already owned. Budget: $0 borrowed or existing; a basic replacement is enough.':'Learn your preferences before spending on premium stationery.'}))
];
export const quests=[
 {id:'tennis-session',hobbyId:'tennis',title:'A little court time',description:'Complete one 20-minute court or wall session.',target:20,unit:'minutes',xp:60,requires:['ten-gear','ten-safety'],period:'week',max:1},
 {id:'cycling-checks',hobbyId:'cycling',title:'Good rides start here',description:'Perform two ABC pre-ride checks.',target:2,unit:'checks',xp:40,requires:['cyc-check'],period:'week',max:1},
 {id:'swimming-sessions',hobbyId:'swimming',title:'Find your flow',description:'Complete two supervised technique sessions.',target:2,unit:'sessions',xp:75,requires:['swi-safety'],period:'week',max:1},
 {id:'journaling-week',hobbyId:'journaling',title:'A few words for yourself',description:'Write three entries this week.',target:3,unit:'entries',xp:60,requires:['jou-tools'],period:'week',max:1}
];
export const achievements=[
 {id:'first-step',name:'First Step',description:'Complete your first skill.',xp:25,icon:'✦'},
 {id:'curious-mind',name:'Curious Mind',description:'Enroll in all four hobbies.',xp:0,icon:'✿'},
 {id:'real-world',name:'Real-World Action',description:'Complete your first practice skill.',xp:50,icon:'↗'},
 {id:'well-rounded',name:'Well Rounded',description:'Reach level 2 in two hobbies.',xp:0,icon:'◈'},
 {id:'renaissance',name:'Renaissance Beginner',description:'Reach level 2 in all four hobbies.',xp:0,icon:'☀'},
 {id:'ten-sessions',name:'Ten Sessions',description:'Log ten practice sessions.',xp:100,icon:'▤'}
];
export const avatarItems=[
 ...spriteWardrobe,
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
