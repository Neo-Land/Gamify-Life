/** Sprite-pack avatar: layered PNGs on a fixed canvas. Offsets are body-relative pixels.
 * Skin and hair are recolored per pixel by nearest base color with shading preserved, because
 * the source art is soft-shaded (thousands of colors) and each head has its own base tones. */
export const SPRITE_CANVAS={width:104,height:150};
export const BODY_ORIGIN={x:6,y:6};
export const BODY_SRC='/sprites/body/body_front.png';
export type Palette={skin?:string;hair?:string;all?:'skin';keep?:string[]};
export const BODY_PALETTE:Palette={skin:'#f5c09e',all:'skin'};
export type SpriteLayer={src:string;x:number;y:number;scale?:number;full?:boolean;frames?:readonly string[];z?:number};
export type SpriteItem={id:string;slot:string;name:string;layers:SpriteLayer[];z:number;palette?:Palette;covers?:string[];anchor?:AnchorName;hidden?:boolean};
const hair=(id:string,name:string,file:string,x:number,y:number,palette:Palette):SpriteItem=>({id,slot:'hair',name,layers:[{src:`/sprites/hair_accessories/${file}`,x,y}],z:40,palette});
const one=(id:string,slot:string,name:string,src:string,x:number,y:number,z:number,extra:Partial<SpriteItem>&{scale?:number;full?:boolean}={}):SpriteItem=>{const {scale,full,...rest}=extra;return {id,slot,name,layers:[{src,x,y,scale,full}],z,...rest};};
export const spriteItems:SpriteItem[]=[
 hair('sp-hair-01','Short crop','hair_01.png',9,-6,{skin:'#f6c5a1',hair:'#5c382c'}),
 hair('sp-hair-02','Bob','hair_02.png',9,-6,{skin:'#f6b99a',hair:'#5c382c'}),
 hair('sp-hair-03','Red curls','hair_03.png',6,-6,{skin:'#ce8d64',hair:'#982e29'}),
 hair('sp-hair-04','Afro','hair_04_afro.png',1,-14,{skin:'#956a45',hair:'#38201b'}),
 hair('sp-hair-05','Bandana','hair_05_bandana.png',4,-6,{skin:'#9b7049',keep:['#b33b34','#91282e']}),
 hair('sp-hair-06','Goggles','hair_06_goggles_mask.png',11,-6,{skin:'#937559',hair:'#72574b'}),
 one('sp-chest-orange','top','Orange tee','/sprites/chests/chest_01_orange.png',15,53,20),
 one('sp-chest-purple','top','Purple tee','/sprites/chests/chest_02_purple.png',15,53,20),
 one('sp-chest-green','top','Green tee','/sprites/chests/chest_03_green.png',13,54,20),
 one('sp-shoe-cream','shoes','Cream sneakers','/sprites/equipment/shoe_cream.png',0,0,15,{full:true}),
 one('sp-shoe-brown','shoes','Brown boots','/sprites/equipment/shoe_brown.png',0,0,15,{full:true}),
 one('sp-shoe-navy','shoes','Navy trainers','/sprites/equipment/shoe_navy.png',0,0,15,{full:true}),
 one('sp-companion-ball','prop','Ball companion','/sprites/equipment/companion_ball.png',0,0,5,{full:true,anchor:'pelvis',hidden:true}),
 one('sp-companion-droplets','prop','Water-droplet trail','/sprites/equipment/companion_droplets.png',0,0,5,{full:true,anchor:'pelvis',hidden:true}),
 one('sp-companion-pages','prop','Floating pages','/sprites/equipment/companion_pages.png',0,0,70,{full:true,anchor:'torso',hidden:true}),
 one('sp-pants-shorts','bottoms','Orange shorts','/sprites/pants/pants_01_orange_shorts.png',20,78,10),
 one('sp-pants-maroon','bottoms','Maroon trousers','/sprites/pants/pants_02_maroon.png',20,78,10),
 one('sp-pants-capri','bottoms','Blue capris','/sprites/pants/pants_03_blue_capri.png',18,78,10),
 one('sp-pants-jeans','bottoms','Navy jeans','/sprites/pants/pants_04_navy_jeans.png',17,78,10),
 one('sp-outfit-hoodie','outerwear','Casual hoodie','/sprites/modular_outfits/clothing_sets/clothingset_01_casual_hoodie.png',-2,4,30,{covers:['top','bottoms']}),
 one('sp-outfit-vest','outerwear','Utility vest','/sprites/modular_outfits/clothing_sets/clothingset_02_utility_vest.png',5,4,30,{covers:['top','bottoms']}),
 one('sp-outfit-adventurer','outerwear','Adventurer','/sprites/modular_outfits/clothing_sets/clothingset_03_adventurer.png',3,4,30,{covers:['top','bottoms']}),
 one('sp-suit-hazmat','outerwear','Hazmat suit','/sprites/modular_outfits/work_suit/worksuit_01_hazmat_yellow.png',6,4,30,{covers:['top','bottoms']}),
 one('sp-suit-blue','outerwear','Blue jumpsuit','/sprites/modular_outfits/work_suit/worksuit_02_jumpsuit_blue.png',8,44,30,{covers:['top','bottoms']}),
 one('sp-suit-orange','outerwear','Orange jumpsuit','/sprites/modular_outfits/work_suit/worksuit_03_jumpsuit_orange.png',9,44,30,{covers:['top','bottoms']}),
 one('sp-cap','headwear','Cap','/sprites/equipment/equipment_03_cap.png',13,-9,60,{scale:.82}),
 one('sp-mask','faceAccessory','Face mask','/sprites/equipment/equipment_04_mask.png',34,40,50,{scale:.45}),
 {id:'sp-backpack',slot:'backItem',name:'Backpack',z:-10,layers:[{src:'/sprites/equipment/equipment_02_backpack.png',x:10,y:40},{src:'/sprites/equipment/backpack_straps.png',x:0,y:0,full:true,z:25}]},
 one('sp-wrench','prop','Wrench','/sprites/equipment/equipment_01_wrench.png',64,72,70,{scale:.45})
];
export const spriteById=Object.fromEntries(spriteItems.map(i=>[i.id,i])) as Record<string,SpriteItem>;
export const spriteDefaults:Record<string,string>={hair:'sp-hair-01',top:'sp-chest-orange',bottoms:'sp-pants-jeans',shoes:'sp-shoe-cream'};
export const spriteSlots:[string,string][]=[['body','Skin'],['hair','Hair'],['hairColor','Hair color'],['top','Tops'],['bottoms','Bottoms'],['shoes','Shoes'],['outerwear','Outfits'],['headwear','Headwear'],['faceAccessory','Face accessories'],['backItem','Bags'],['prop','Hobby props']];
/** Earned cosmetics from the skill tree predate the sprite pack. Each maps to the nearest pack art so
 * an unlock is always visible; the hand-drawn replacements can land one at a time without touching rewards. */
export const spriteAliases:Record<string,string>={
 'prop-tennis-tube':'sp-wrench','prop-cycle-pump':'sp-wrench','prop-cycle-wheel':'sp-wrench','prop-quill':'sp-wrench','prop-pen-sword':'sp-wrench','prop-toolbelt':'sp-wrench',
 'prop-tennis-bag':'sp-backpack','prop-swim-board':'sp-backpack','prop-swim-towel':'sp-backpack',
 'prop-ball':'sp-companion-ball','prop-water-trail':'sp-companion-droplets','prop-page-aura':'sp-companion-pages',
 'mac-sweater':'sp-chest-purple','renaissance-sweater':'sp-chest-green',
 visor:'sp-cap',helmet:'sp-cap','rounded-pin':'sp-cap',goggles:'sp-mask',satchel:'sp-backpack'
};
/** Authored animation frames on the 104×150 canvas; durations are the authored seconds in ms.
 * Anchors are absolute canvas pixels. A modular layer is drawn once and translated by the frame's
 * delta from the base frame, so a hat or shirt follows a posed body without being redrawn 15 times. */
export const GROUND_Y=131;
export const BASE_FRAME=0;
export type SpriteFrame={ms:number;head:{x:number;y:number};pelvis:{x:number;y:number};hand:{x:number;y:number}};
/** Head and pelvis are the authored values. `hand` is the character's right hand, derived from the
 * body silhouette (base 84,106) so held tools track the arm: it rides the body through idle and walk,
 * then leads the swing through the action frames. */
export const spriteFrames:readonly SpriteFrame[]=[
 {ms:200,head:{x:52,y:48},pelvis:{x:52,y:88},hand:{x:84,y:106}}, // 1  idle · stand base (reference pose)
 {ms:200,head:{x:52,y:46},pelvis:{x:52,y:88},hand:{x:84,y:105}}, // 2  idle · inhale
 {ms:200,head:{x:52,y:46},pelvis:{x:52,y:86},hand:{x:84,y:104}}, // 3  idle · peak rest
 {ms:200,head:{x:52,y:48},pelvis:{x:52,y:88},hand:{x:84,y:106}}, // 4  idle · exhale
 {ms:120,head:{x:52,y:48},pelvis:{x:52,y:88},hand:{x:84,y:106}}, // 5  walk · contact
 {ms:120,head:{x:52,y:50},pelvis:{x:52,y:90},hand:{x:82,y:108}}, // 6  walk · recoil (lowest)
 {ms:120,head:{x:52,y:46},pelvis:{x:52,y:86},hand:{x:86,y:104}}, // 7  walk · passing
 {ms:120,head:{x:52,y:48},pelvis:{x:52,y:88},hand:{x:84,y:106}}, // 8  walk · contact (opposite)
 {ms:120,head:{x:52,y:50},pelvis:{x:52,y:90},hand:{x:86,y:108}}, // 9  walk · recoil (opposite)
 {ms:120,head:{x:52,y:46},pelvis:{x:52,y:86},hand:{x:82,y:104}}, // 10 walk · passing (opposite)
 {ms:100,head:{x:48,y:48},pelvis:{x:48,y:90},hand:{x:76,y:100}}, // 11 action · windup (drawn back)
 {ms:80 ,head:{x:46,y:46},pelvis:{x:46,y:88},hand:{x:72,y:94 }}, // 12 action · hold / anticipation
 {ms:60 ,head:{x:60,y:52},pelvis:{x:58,y:92},hand:{x:96,y:108}}, // 13 action · impact / strike (thrust)
 {ms:120,head:{x:58,y:50},pelvis:{x:56,y:90},hand:{x:92,y:112}}, // 14 action · follow-through
 {ms:150,head:{x:52,y:48},pelvis:{x:52,y:88},hand:{x:84,y:106}}  // 15 action · recovery
];
export const spriteTags={idle:{from:0,to:3},walk:{from:4,to:9},action:{from:10,to:14}} as const;
export type AnimationTag=keyof typeof spriteTags;
export type AnchorName='head'|'pelvis'|'torso'|'hand';
/** Torso garments span head and pelvis, so they take the mean of those two deltas. */
const anchorBySlot:Record<string,AnchorName>={hair:'head',headwear:'head',faceAccessory:'head',top:'torso',outerwear:'torso',backItem:'torso',bottoms:'pelvis',prop:'hand'};
export const anchorFor=(item:SpriteItem|null):AnchorName=>item?item.anchor??anchorBySlot[item.slot]??'pelvis':'pelvis';
export function anchorDelta(frame:number,anchor:AnchorName){const f=spriteFrames[frame]??spriteFrames[BASE_FRAME],b=spriteFrames[BASE_FRAME];const of=(k:'head'|'pelvis'|'hand')=>({x:f[k].x-b[k].x,y:f[k].y-b[k].y});if(anchor!=='torso')return of(anchor);const h=of('head'),p=of('pelvis');return {x:Math.round((h.x+p.x)/2),y:Math.round((h.y+p.y)/2)};}
/** Full-canvas body frames indexed like spriteFrames. Empty keeps the single static body: drop 15
 * transparent 104×150 PNGs in public/sprites/body/frames/ and list them here to switch animation on. */
export const BODY_FRAMES:readonly string[]=[];
export const bodyIsAnimated=()=>BODY_FRAMES.length===spriteFrames.length;
export function hexToRgb(hex:string):[number,number,number]{const n=parseInt(hex.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
export function rgbToHsl(r:number,g:number,b:number):[number,number,number]{r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;if(max===min)return [0,0,l];const d=max-min,s=l>.5?d/(2-max-min):d/(max+min);let h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4;h*=60;return [h,s,l];}
export function hslToRgb(h:number,s:number,l:number):[number,number,number]{h=((h%360)+360)%360;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const [r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
const hueDist=(a:number,b:number)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));
/** Distance in a normalized hue/saturation/lightness space; CUTOFF is the assignment limit. */
const colorDist=(h:number,s:number,l:number,base:[number,number,number])=>Math.hypot(hueDist(h,base[0])/40,(s-base[1])/.4,(l-base[2])/.35);
const CUTOFF=2.4;
/** Shading is carried over as an additive luminance offset from the sprite's own base, scaled down for dark targets. */
const shade=(targetL:number,pixelL:number,baseL:number)=>{const o=(pixelL-baseL)*clamp(targetL/baseL,.45,1);return clamp(targetL+(o>0?o*Math.min(1,(1-targetL)*1.6):o),.03,.96);};
export type RecolorSpec={palette:Palette;skin?:string;hair?:string};
/** Mutates RGBA pixels. Outline (very dark) and grey pixels are left alone. */
export function recolorPixels(d:Uint8ClampedArray,{palette,skin,hair}:RecolorSpec){
 const skinBase=palette.skin&&skin?rgbToHsl(...hexToRgb(palette.skin)):null,skinT=skin?rgbToHsl(...hexToRgb(skin)):null;
 const hairBase=palette.hair&&hair?rgbToHsl(...hexToRgb(palette.hair)):null,hairT=hair?rgbToHsl(...hexToRgb(hair)):null;
 const keep=(palette.keep||[]).map(k=>rgbToHsl(...hexToRgb(k)));
 if(!skinBase&&!hairBase)return;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<8)continue;const [h,s,l]=rgbToHsl(d[i],d[i+1],d[i+2]);if(l<.1||s<.1)continue;
  let target:[number,number,number]|null=null,baseL=0,best=CUTOFF;
  for(const k of keep){const dist=colorDist(h,s,l,k);if(dist<best){best=dist;target=null;}}
  if(skinBase&&skinT){const dist=palette.all==='skin'?0:colorDist(h,s,l,skinBase);if(dist<best){best=dist;target=skinT;baseL=skinBase[2];}}
  if(hairBase&&hairT){const dist=colorDist(h,s,l,hairBase);if(dist<best){best=dist;target=hairT;baseL=hairBase[2];}}
  if(!target)continue;const [r,g,b]=hslToRgb(target[0],target[1],shade(target[2],l,baseL));d[i]=r;d[i+1]=g;d[i+2]=b;
 }
}
/** Resolve which sprite layers to draw for a saved avatar selection, in z order. */
export function resolveSpriteLayers(selection:Record<string,string>):{item:SpriteItem|null;layer:SpriteLayer;z:number}[]{
 const items:SpriteItem[]=[];
 for(const slot of new Set([...Object.keys(spriteDefaults),...Object.keys(selection)])){const chosen=selection[slot]||'',aliased=spriteAliases[chosen]||'';const item=spriteById[chosen]||spriteById[aliased]||spriteById[spriteDefaults[slot]||''];if(item&&(item.slot===slot||!!aliased)&&!items.includes(item))items.push(item);}
 const covered=new Set(items.flatMap(i=>i.covers||[]));
 const layers:{item:SpriteItem|null;layer:SpriteLayer;z:number}[]=items.filter(i=>!covered.has(i.slot)).flatMap(item=>item.layers.map(layer=>({item,layer,z:layer.z??item.z})));
 layers.push({item:null,layer:bodyIsAnimated()?{src:BODY_FRAMES[BASE_FRAME],frames:BODY_FRAMES,x:0,y:0,full:true}:{src:BODY_SRC,x:0,y:0},z:0});
 return layers.sort((a,b)=>a.z-b.z);
}
