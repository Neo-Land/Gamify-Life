import {bodyRigIds,legacyBodyRig} from './body-rigs';
import {tintIds} from './tints';
import {colorwayIds} from './colorways';
import {wallpaperIds} from './wallpapers/ids';
import { z } from 'zod';
import { hobbyIds } from './content';
import {appIds} from './window-layout';
export const windowSchema=z.object({appId:z.enum(appIds),isOpen:z.boolean(),isMinimized:z.boolean(),isMaximized:z.boolean().default(false),zIndex:z.number(),x:z.number(),y:z.number(),width:z.number().min(1),height:z.number().min(1),route:z.string().regex(/^\/(hobbies|quests|character|loadout|achievements|calendar|settings)(\/[a-z0-9-]+)*$/)});
export const evidenceSchema=z.object({confirmed:z.boolean().default(false),value:z.number().nonnegative().max(100000).optional(),note:z.string().max(2000).default(''),confidence:z.number().int().min(1).max(5).default(3)});
export const profileSchema=z.object({name:z.string().trim().min(1).max(40),onboardingComplete:z.boolean(),reducedMotion:z.boolean(),sound:z.boolean(),theme:z.enum(['warm','contrast']),characterCreated:z.boolean().default(false),characterTint:z.enum(tintIds).nullable().default(null),characterSkipped:z.boolean().default(false),dockPosition:z.enum(['top','bottom','left','right']).default('bottom'),scanlinesEnabled:z.boolean().default(true),bootAnimationEnabled:z.boolean().default(true),largerText:z.boolean().default(false),uiSchemaVersion:z.literal(2).default(2),dashboardEdge:z.enum(['left','right','top','bottom']).default('left'),themeId:z.enum(['fall','summer','winter','spring']).default('spring'),animationIntensity:z.enum(['off','low','normal']).default('low'),bodyRigId:z.preprocess(legacyBodyRig,z.enum(bodyRigIds)).default('average-average'),characterPosition:z.enum(['left','center','right','auto']).default('auto'),selectedPreviewHobbyId:z.enum(hobbyIds).default('tennis'),lastSeenOn:z.string().default(''),colorway:z.enum(colorwayIds).default('sage'),wallpaper:z.enum(wallpaperIds).default('auto')});
export const planSchema=z.object({id:z.string().uuid(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s,'Choose a valid date.'),hobbyId:z.enum(hobbyIds),duration:z.number().int().min(1).max(1440),note:z.string().trim().max(200)});
export const stateSchema=z.object({version:z.literal(1),plans:z.array(planSchema).default([]),windows:z.preprocess(v=>v&&typeof v==='object'?Object.fromEntries(Object.entries(v as Record<string,{appId?:string}>).filter(([,w])=>(appIds as readonly string[]).includes(w?.appId??''))):v,z.record(z.string(),windowSchema)).default({}),profile:profileSchema,enrollments:z.array(z.enum(hobbyIds)),progress:z.record(z.string(),z.object({status:z.enum(['in_progress','completed','mastered']),startedAt:z.string(),completedAt:z.string().optional(),masteredAt:z.string().optional(),evidence:evidenceSchema.optional(),contentVersion:z.number().optional()})),ledger:z.array(z.object({id:z.string(),hobbyId:z.string().nullable(),amount:z.number(),source:z.string(),at:z.string()})),quests:z.record(z.string(),z.object({pinned:z.boolean(),value:z.number(),period:z.string(),completed:z.boolean()})),gear:z.record(z.string(),z.enum(['owned','borrowing','need','wishlist','not_needed'])),avatar:z.record(z.string(),z.string()),achievements:z.array(z.string()),placements:z.record(z.string(),z.object({level:z.number().int().min(0).max(3),answers:z.record(z.string(),z.number().int().min(0).max(4)).default({}),skipped:z.boolean().default(false),at:z.string()})).default({}),practice:z.array(z.object({id:z.string(),hobbyId:z.string(),nodeId:z.string().optional(),duration:z.number(),note:z.string(),at:z.string()})),activity:z.array(z.object({id:z.string(),text:z.string(),at:z.string(),xp:z.number()})),recommendation:z.object({id:z.string(),visits:z.number()})});
export type State=z.infer<typeof stateSchema>;
export type Evidence=z.infer<typeof evidenceSchema>;
export const commandSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('plan'),plan:planSchema}),
 z.object({type:z.literal('cancel-plan'),id:z.string().uuid()}),
 z.object({type:z.literal('pause-hobby'),hobbyId:z.enum(hobbyIds)}),
 z.object({type:z.literal('window'),window:windowSchema}),
 z.object({type:z.literal('layout-reset')}),
 z.object({type:z.literal('profile'),input:profileSchema.partial().extend({characterCreated:z.boolean().optional(),lastSeenOn:z.string().optional(),colorway:z.enum(colorwayIds).optional(),wallpaper:z.enum(wallpaperIds).optional(),characterTint:z.enum(tintIds).nullable().optional(),characterSkipped:z.boolean().optional(),dockPosition:z.enum(['top','bottom','left','right']).optional(),scanlinesEnabled:z.boolean().optional(),bootAnimationEnabled:z.boolean().optional(),largerText:z.boolean().optional(),uiSchemaVersion:z.literal(2).optional(),dashboardEdge:z.enum(['left','right','top','bottom']).optional(),themeId:z.enum(['fall','summer','winter','spring']).optional(),animationIntensity:z.enum(['off','low','normal']).optional(),bodyRigId:z.enum(bodyRigIds).optional(),characterPosition:z.enum(['left','center','right','auto']).optional(),selectedPreviewHobbyId:z.enum(hobbyIds).optional()})}),
 z.object({type:z.literal('enroll'),hobbyIds:z.array(z.enum(hobbyIds)).min(1)}),
 z.object({type:z.literal('start'),nodeId:z.string()}),
 z.object({type:z.literal('complete'),nodeId:z.string(),evidence:evidenceSchema}),
 z.object({type:z.literal('master'),nodeId:z.string(),evidence:evidenceSchema}),
 z.object({type:z.literal('pin'),questId:z.string(),pinned:z.boolean()}),
 z.object({type:z.literal('quest'),questId:z.string(),delta:z.number().positive().max(1000)}),
 z.object({type:z.literal('practice'),id:z.string().uuid(),hobbyId:z.enum(hobbyIds),nodeId:z.string().optional(),duration:z.number().int().min(1).max(1440),note:z.string().max(2000)}),
 z.object({type:z.literal('gear'),gearId:z.string(),status:z.enum(['owned','borrowing','need','wishlist','not_needed'])}),
 z.object({type:z.literal('avatar-preset'),items:z.record(z.string(),z.string())}),
 z.object({type:z.literal('avatar'),slot:z.string(),itemId:z.string()}),
 z.object({type:z.literal('visit')}),z.object({type:z.literal('placement'),hobbyId:z.enum(hobbyIds),answers:z.record(z.string(),z.number().int().min(0).max(4)),skipped:z.boolean().default(false)})
]);
export type Command=z.infer<typeof commandSchema>;
export function initialState():State{return {version:1,plans:[],windows:{},profile:profileSchema.parse({name:'Player',onboardingComplete:false,reducedMotion:false,sound:false,theme:'warm'}),enrollments:[],progress:{},ledger:[],quests:{},gear:{},avatar:{outerwear:'outerwear-none',headwear:'headwear-none',faceAccessory:'faceAccessory-none',backItem:'backItem-none',face:'face-bright',eyeColor:'eye-umber',body:'skin-warm',hair:'hair-curls',hairColor:'color-espresso',top:'top-sage',bottoms:'bottom-olive',shoes:'shoe-cream',accessory:'none',prop:'prop-none'},achievements:[],placements:{},practice:[],activity:[],recommendation:{id:'',visits:0}};}
export type CompletionResult={state:State;xpAwarded:number;unlockedNodeIds:string[];newAchievementIds:string[];newAvatarItemIds:string[]};
