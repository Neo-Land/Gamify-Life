'use client';
import {useEffect,useId,useState,type ReactNode,type PointerEvent} from 'react';
import {bodyRigs,type BodyRigId} from '@/lib/body-rigs';
import {RigLayer,headSkull} from './rig-layers';
import {avatarItems} from '@/lib/content';
import {tints,type TintId} from '@/lib/tints';
import {hairArt,boxPath,type Box} from '@/lib/hair';
import {hatArt,glassArt} from '@/lib/headwear';
export type AvatarPose='front'|'left'|'right'|'back';
/** Ground and neck in authored canvas units, then how far each half is pushed from there. */
const GROUND=364,NECK=140,HEAD_SCALE=2.18,BODY_W=.8,BODY_H=.48,PROP_SCALE=.82;
/** The authored point of each prop that has to end up inside the hand. Props were drawn for the
 * original uniform-scale doll and merely sat near the hand; once the body scaled .8 across and .48
 * down they drifted off it entirely. Each one is now placed by its grip, at a uniform scale so a
 * racquet does not come out short and wide. */
const propGrips:[string,[number,number]][]=[['racquet',[213,250]],['notebook',[200,234]],['quill',[206,200]],
 ['pen-sword',[210,250]],['pump',[204,200]],['tube',[208,220]],['bag',[210,190]],['board',[208,218]],
 ['towel',[212,198]],['wheel',[219,265]]];
/** Original 256 × 384 paper doll. Painted SVG pixels are also the hit masks:
 * browser hit testing returns the topmost painted shape, never its transparent box. */
export function Avatar({selection,large=false,pose='front',onPart,interactive=false,bodyRigId='average-average',animation='idle',viewBox='0 0 256 384',decorative=false,tint=null}:{selection:Record<string,string>;tint?:TintId|null;bodyRigId?:BodyRigId;animation?:'idle'|'gesture'|'celebration';large?:boolean;pose?:AvatarPose;onPart?:(slot:string|null,activate:boolean,touch:boolean)=>void;interactive?:boolean;viewBox?:string;decorative?:boolean}){
 /** Unique per instance: several avatars share a page and a clip id must not collide. */
 const clipId=`hair-shadow-${useId().replace(/[^a-zA-Z0-9]/g,'')}`;
 const [hover,setHover]=useState<string|null>(null),[hidden,setHidden]=useState(false);
 useEffect(()=>{const update=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 const shade=(hex:string,amount:number)=>{const n=parseInt(hex.slice(1),16);const mix=(c:number)=>Math.max(0,Math.min(255,Math.round(c*(1-amount))));return `#${[(n>>16)&255,(n>>8)&255,n&255].map(c=>mix(c).toString(16).padStart(2,'0')).join('')}`;};
 const item=(slot:string)=>avatarItems.find(i=>i.id===selection[slot]);
 /** A placeholder character is one hue at many values — flat single-colour loses the silhouette.
  * Face and eye line work keep their authored near-black, or the face becomes a smudge. */
 const tintRamp:Record<string,number>={body:-.25,top:0,outerwear:.1,bottoms:.22,shoes:.4,socks:.4,backItem:.4,accessory:.34,headwear:.3,faceAccessory:.3,prop:.36,hair:.48,hairColor:.48};
 const color=(slot:string,fallback:string)=>tint&&slot in tintRamp?shade(tints[tint],tintRamp[slot]):item(slot)?.color||fallback;
 /** Clothing accents are authored as fixed hexes. Re-map them onto the tint by luminance so a light
  * seam stays light and a dark one stays dark. Pure black is a shadow, not a colour, so it passes through. */
 const tone=tint?(hex:string)=>hex==='#000000'?hex:shade(tints[tint],.55-lum(hex)*1.1):(hex:string)=>hex;
 const lum=(hex:string)=>{const n=parseInt(hex.slice(1),16);return ((n>>16&255)*.299+((n>>8)&255)*.587+(n&255)*.114)/255;};
 const skin=color('body','#DCAE83'),hairColor=color('hairColor','#3F342F'),hair=selection.hair?.replace('hair-','')||'curls',legacy=selection.accessory,prop=selection.prop||'prop-none',back=pose==='back',side=pose==='left'||pose==='right';
 const face=selection.face||'face-bright',head=selection.headwear||'',glasses=selection.faceAccessory||'',bag=selection.backItem||'';
 const rig=bodyRigs[bodyRigId]||bodyRigs['average-average'];
 const has=(s:string)=>!!s&&!s.endsWith('-none');
 /** Chibi proportions without touching a single authored path: the head scales up about the neck,
  * the body scales down about the feet, and both meet at the same neck point. Every rig, clothing
  * pattern and attachment follows automatically because they are all derived from rig anchors. */
 const neckY=NECK+rig.headOffset,headDrop=GROUND+(neckY-GROUND)*BODY_H-neckY;
 const bodyTransform=`translate(128 ${GROUND}) scale(${BODY_W} ${BODY_H}) translate(-128 ${-GROUND})`;
 /** Drop the head until its chin meets the shoulder line, so there is no neck to see. */
 const seat=GROUND+(rig.anchors.leftShoulder.y-GROUND)*BODY_H-(headDrop+rig.headOffset+NECK+(134-NECK)*HEAD_SCALE);
 /** Where the arms and hands are, in head space, so the hair can be cut away from them: hair
  * falling past the shoulders must never hide an arm, on any build or in any view. */
 const armHoles=(()=>{const a=rig.anchors,l=side?rig.sideHip:a.leftShoulder.x,r=side?256-rig.sideHip:a.rightShoulder.x,w=rig.arm+2,top=a.leftShoulder.y+16,bottom=a.leftHand.y+14,lift=headDrop+rig.headOffset+seat;
  const hx=(x:number)=>128+(x-128)*BODY_W/HEAD_SCALE,hy=(y:number)=>NECK+(GROUND+(y-GROUND)*BODY_H-lift-NECK)/HEAD_SCALE;
  return [l-w,r].map(x=>`M${hx(x)} ${hy(top)}H${hx(x+w)}V${hy(bottom)}H${hx(x)}z`).join('');})();
 const headTransform=`translate(0 ${headDrop+rig.headOffset+seat}) translate(128 ${NECK}) scale(${HEAD_SCALE}) translate(-128 ${-NECK})`;
 const hand={x:128+(rig.anchors.rightHand.x-128)*BODY_W,y:GROUND+(rig.anchors.rightHand.y-GROUND)*BODY_H};
 const grip=propGrips.find(([k])=>prop.includes(k))?.[1]||[200,230];
 const heldTransform=`translate(${hand.x} ${hand.y}) scale(${PROP_SCALE}) translate(${-grip[0]} ${-grip[1]})`;
 const part=(name:string,slot:string|null,children:ReactNode)=>{const headLayer=['head','face','hair-back','hair-front','headwear','face-accessory'].includes(name);const held=name==='held-item'&&!prop.includes('toolbelt');const attachment=name==='back-item'?{x:rig.anchors.back.x-192,y:rig.anchors.back.y-206}:name==='neck-accessory'?{x:0,y:rig.headOffset}:null;return <g data-layer={name} data-slot={slot||undefined} transform={name==='shadow'?undefined:held?heldTransform:headLayer?headTransform:attachment?`${bodyTransform} translate(${attachment.x} ${attachment.y})`:bodyTransform} data-highlighted={interactive&&slot===hover?'true':undefined} className={interactive&&slot?'editable-pixels':undefined}>{['head','body','top','bottoms','bottoms-cuff','socks','shoes','outerwear','chin-shadow'].includes(name)?<RigLayer tone={tone} layer={name} rig={rig} side={side} back={back} id={selection[slot||'']||''} color={color(slot||'','#819776')} skin={skin}/>:children}</g>;};
 function pointer(e:PointerEvent<SVGSVGElement>,activate:boolean){if(!interactive)return;const slot=(e.target as Element).closest('[data-slot]')?.getAttribute('data-slot')||null;setHover(slot);onPart?.(slot,activate,e.pointerType==='touch');}
 const description=['top','bottoms','shoes','hair','headwear','faceAccessory','backItem','prop'].map(s=>item(s)?.name).filter(n=>n&&!n.toLowerCase().startsWith('no ')&&n!=='none').join(', ');
 const hairPieces=hairArt(hair,back?'back':side?'side':'front');
 const hat=hatArt(head,legacy||'',back?'back':side?'side':'front'),spec=glassArt(glasses,legacy||'',side);
 const eyes=[107,149],sideEye=157,lash='#3a2f26',iris=color('eyeColor',{'color-espresso':'#7d5730','color-chestnut':'#9c6f37','color-gold':'#c8942f','color-silver':'#6c8b99','color-copper':'#6a8f4e','color-ink':'#46566a'}[selection.hairColor||'']||'#7d5730');
 /** Expressions. Every face sets its own lid drop, pupil width, lid shape, brow and mouth. Before
  * this they shared one eye and one brow bar — `closedEyes` for calm and tired, five brow shapes,
  * a rectangle for a mouth — so eleven of the twelve read as the same face. `drop` and `pupil` are
  * whole pixels rather than fractions of a scale, so nothing here depends on how a value rounds.
  * rosy / freckles / moles / brows are feature variants: they keep the neutral eye and add their
  * one detail further down. */
 type Expression={drop:number;pupil:number;lid:'open'|'calm'|'joy';brow:string;mouth:string;squint?:boolean;shadow?:boolean};
 const expressions:Record<string,Expression>={
  neutral:{drop:0,pupil:5,lid:'open',brow:'neutral',mouth:'flat'},
  happy:{drop:2,pupil:5,lid:'open',brow:'raised',mouth:'smile',squint:true},
  bright:{drop:0,pupil:6,lid:'open',brow:'raised',mouth:'grin'},
  calm:{drop:0,pupil:5,lid:'calm',brow:'soft',mouth:'content'},
  curious:{drop:0,pupil:6,lid:'open',brow:'curious',mouth:'open'},
  focused:{drop:4,pupil:4,lid:'open',brow:'focused',mouth:'small'},
  tired:{drop:5,pupil:4,lid:'open',brow:'tired',mouth:'small',shadow:true},
  victory:{drop:0,pupil:5,lid:'joy',brow:'raised',mouth:'open-grin'},
  rosy:{drop:0,pupil:5,lid:'open',brow:'neutral',mouth:'smile'},
  freckles:{drop:0,pupil:5,lid:'open',brow:'neutral',mouth:'flat'},
  moles:{drop:0,pupil:5,lid:'open',brow:'neutral',mouth:'flat'},
  brows:{drop:0,pupil:5,lid:'open',brow:'heavy',mouth:'flat'}};
 const expr=expressions[face.replace('face-','')]||expressions.neutral;
 /** Brows carry a lot of the expression, so every face has them; the shape is what varies.
  * They live between the hairline at y56 and the upper lash at y72. */
 const brow=(cx:number):Box[]=>{const out=cx<128?-1:1,s=expr.brow;
  if(s==='heavy')return [[cx-13,63,26,7]];
  if(s==='raised')return [[cx-12,61,24,5],[cx-5,58,13,3]];
  if(s==='soft')return [[cx-11,65,22,4]];
  // Sloping down toward the outer corner reads as weary; sloping toward the nose reads as cross.
  if(s==='tired')return [[out<0?cx-12:cx+2,66,10,4],[out<0?cx-2:cx-12,63,14,4]];
  if(s==='focused')return [[cx-12,62,24,5],[out<0?cx+2:cx-12,66,10,5]];
  // Only one brow lifts, which is the whole point of the expression.
  if(s==='curious')return out<0?[[cx-12,60,24,5],[cx-5,57,13,3]]:[[cx-12,65,24,5]];
  return [[cx-12,64,24,5]];};
 const sideBrow=():Box[]=>{const s=expr.brow;
  if(s==='raised')return [[149,61,21,5],[155,58,13,3]];
  if(s==='curious')return [[149,60,21,5],[155,57,13,3]];
  if(s==='soft'||s==='tired')return [[150,65,19,4]];
  if(s==='focused')return [[149,60,21,5],[160,64,10,5]];
  if(s==='heavy')return [[148,62,22,7]];
  return [[149,62,21,5]];};
 /** Mouths. A smile is its corners lifting off the line, not a bar with a second bar under it. */
 const mouths:Record<string,Box[]>={flat:[[119,120,18,4]],small:[[122,121,12,3]],
  smile:[[120,121,16,4],[115,118,6,3],[135,118,6,3]],
  content:[[121,120,14,3],[117,118,5,3],[134,118,5,3]],
  grin:[[118,119,20,5],[113,115,6,4],[137,115,6,4]],
  open:[[122,118,12,7],[124,120,8,4]],
  'open-grin':[[116,116,24,6],[119,122,18,5],[113,113,5,4],[138,113,5,4]]};
 const sideMouths:Record<string,Box[]>={flat:[[156,117,11,4]],small:[[158,118,9,3]],
  smile:[[156,117,11,4],[153,114,4,3]],content:[[157,117,10,3],[154,115,4,3]],
  grin:[[155,116,12,5],[152,113,4,3]],open:[[159,117,8,5]],'open-grin':[[155,115,12,7],[152,112,4,3]]};
 /** The darker inside of an open mouth, so it is not one solid block of lash colour. */
 const mouthInner:Record<string,Box[]>={open:[[124,120,8,4]],'open-grin':[[120,122,16,4]]};
 const sideMouthInner:Record<string,Box[]>={open:[[160,119,6,3]],'open-grin':[[157,118,9,3]]};
 const mouthArt=side?sideMouths[expr.mouth]||sideMouths.flat:mouths[expr.mouth]||mouths.flat;
 const mouthGap=(side?sideMouthInner:mouthInner)[expr.mouth]||[];
 return <svg className={`avatar pixel-art ${large?'large':''}`} data-rig={bodyRigId} data-animation={animation} data-pose={pose} data-paused={hidden} viewBox={viewBox} role={decorative?'presentation':'img'} aria-hidden={decorative||undefined} aria-label={decorative?undefined:`Pixel character wearing ${description}`} shapeRendering="crispEdges" onPointerMove={e=>{if(e.pointerType!=='touch')pointer(e,false);}} onPointerDown={e=>pointer(e,true)} onPointerLeave={e=>{if(e.pointerType==='touch')return;setHover(null);onPart?.(null,false,false);}}>
 {part('shadow',null,<path d="M86 354h84v4H86zM70 358h116v6H70zM62 364h132v5H62zM74 369h108v4H74zM92 373h72v3H92z" fill="var(--season-shadow,#53634e)" opacity=".28"/>)}
 <g className="avatar-idle">
 {part('hair-back','hair',<g fill={hairColor}><path d={boxPath(hairPieces.back)}/></g>)}
 {part('body','body',null)}
 {part('head','body',null)}
 {part('face','face',!back&&<g>
  {/* Eyes. The old pair were 22x26 on an 84x90 head — a quarter of the face width each — and the
   outer lash was a 3x6 block sitting clear of the lash bar, which is what read as a single dot.
   These are 18x14 with a round iris, and every lash piece overlaps the bar, so the lash runs
   unbroken from the inner corner out to the flick. The sclera band is y79-93. */}
  {side?(()=>{const cx=sideEye,T=79,BM=93,pw=expr.pupil,d=expr.drop;
   return expr.lid!=='open'
    ?<path d={boxPath(expr.lid==='calm'
       ?[[cx-6,86,15,3],[cx-3,84,12,2],[cx+9,84,3,4],[cx+11,81,3,4]]
       :[[cx-4,82,8,3],[cx-10,85,7,3],[cx+3,85,7,3],[cx-13,88,5,3],[cx+8,88,5,3]])} fill={lash}/>
    :<>
     <path d={boxPath([[cx-6,T,14,BM-T],[cx-4,T-2,11,2],[cx-4,BM,11,2]])} fill="#f8f4e8"/>
     <path d={boxPath([[cx+1,T,8,10],[cx,T+2,10,6]])} fill={iris}/>
     <path d={boxPath([[cx+1,T+7,8,3]])} fill={shade(iris,-.28)}/>
     <path d={boxPath([[cx+3,T+2,pw,pw+2]])} fill="#241d18"/>
     <path d={boxPath([[cx+1,T+1,3,3]])} fill="#fffdf5"/>
     <path d={boxPath([[cx+2,BM+2,6,2]])} fill={lash} opacity=".55"/>
     {d>0&&<path d={boxPath([[cx-6,76,14,d+3]])} fill={skin}/>}
     {/* The dark line is an upper lash, not a ring: nothing outlines the lower lid. */}
     <path d={boxPath([[cx-6,75,15,3],[cx+1,73,9,2],[cx+9,75,3,4],[cx+11,72,3,4]])} fill={lash}/>
     {d>0&&<path d={boxPath([[cx-6,75+d,15,3]])} fill={lash}/>}
     {expr.squint&&<><path d={boxPath([[cx-5,BM-3,12,5]])} fill={skin}/><path d={boxPath([[cx-5,BM-4,12,2]])} fill={lash} opacity=".7"/></>}
     {expr.shadow&&<path d={boxPath([[cx-5,BM+2,12,3]])} fill={shade(skin,.22)}/>}
     <g className="avatar-lid"><path d={boxPath([[cx-7,77,16,22]])} fill={skin}/><path d={boxPath([[cx-6,86,15,3]])} fill={lash}/></g>
    </>;})()
  :eyes.map(cx=>{const out=cx<128?-1:1,T=79,BM=93,pw=expr.pupil,d=expr.drop;
   return expr.lid!=='open'
    ?<path key={cx} d={boxPath(expr.lid==='calm'
       ?[[cx-9,87,18,3],[cx-11,85,3,3],[cx+8,85,3,3],[cx+(out<0?-14:11),83,3,4]]
       :[[cx-4,82,8,3],[cx-10,85,7,3],[cx+3,85,7,3],[cx-13,88,5,3],[cx+8,88,5,3]])} fill={lash}/>
    :<g key={cx}>
      <path d={boxPath([[cx-9,T,18,BM-T],[cx-7,T-2,14,2],[cx-7,BM,14,2]])} fill="#f8f4e8"/>
      <path d={boxPath([[cx-5,T,11,10],[cx-6,T+2,13,6]])} fill={iris}/>
      <path d={boxPath([[cx-5,T+7,11,3]])} fill={shade(iris,-.28)}/>
      <path d={boxPath([[cx-Math.floor(pw/2),T+2,pw,pw+2]])} fill="#241d18"/>
      <path d={boxPath([[cx-4,T+1,4,4],[cx+3,T+7,2,2]])} fill="#fffdf5"/>
      <path d={boxPath([[cx+out*2-(out<0?6:0),BM+2,6,2]])} fill={lash} opacity=".55"/>
      {d>0&&<path d={boxPath([[cx-9,76,18,d+3]])} fill={skin}/>}
      {/* The dark line is an upper lash, not a ring: nothing outlines the lower lid. The outer
       tab and the flick each overlap the bar, so there is no detached pixel anywhere on it. */}
      <path d={boxPath([[cx-9,75,18,3],[cx+(out>0?1:-9),73,8,2],[cx+out*9-(out<0?3:0),75,3,4],
       [cx+out*11-(out<0?3:0),72,3,4],[cx-out*9-(out>0?2:0),77,2,3]])} fill={lash}/>
      {d>0&&<path d={boxPath([[cx-9,75+d,18,3]])} fill={lash}/>}
      {/* A happy squint lifts the lower lid rather than dropping the upper one. */}
      {expr.squint&&<><path d={boxPath([[cx-8,BM-3,16,5]])} fill={skin}/><path d={boxPath([[cx-8,BM-4,16,2]])} fill={lash} opacity=".7"/></>}
      {expr.shadow&&<path d={boxPath([[cx-8,BM+2,16,3]])} fill={shade(skin,.22)}/>}
      <g className="avatar-lid"><path d={boxPath([[cx-10,77,20,22]])} fill={skin}/><path d={boxPath([[cx-9,86,18,3]])} fill={lash}/></g>
     </g>;})}
  {/* When hair and skin sit at the same value the brow disappears into both, so push it away from
  them — lighter on dark skin, darker on light. Espresso hair on ebony skin was the case that failed. */}
 <path d={boxPath(side?sideBrow():eyes.flatMap(cx=>brow(cx)))} fill={Math.abs(lum(hairColor)-lum(skin))<.14?shade(hairColor,lum(skin)<.45?-.5:.35):shade(hairColor,.15)}/>
 {/* A soft blush on every face; the rosy variant just turns it up. */}
 <path d={side?'M151 99h13v7h-13zM149 101h17v3h-17z':'M94 101h12v9H94zM92 103h16v5H92zM150 101h12v9h-12zM148 103h16v5h-16z'} fill="#d0766e" opacity={face.includes('rosy')?.45:lum(skin)<.35?.3:.17}/>
 {/* The profile's nose is modelled in the head layer now, so this only shades the front one. */}
 {!side&&<><path d="M124 105h8v4h-8zM122 109h12v4h-12z" fill={shade(skin,.24)}/><path d="M126 106h5v2h-5z" fill={shade(skin,-.14)}/></>}
 <path d={boxPath(mouthArt)} fill={lash}/>
 {mouthGap.length>0&&<path d={boxPath(mouthGap)} fill="#8d4a46"/>}
  {face.includes('freckles')&&<path d={side?'M150 102h4v4h-4zM158 108h4v4h-4z':'M96 102h4v4h-4zM103 109h4v4h-4zM111 103h3v3h-3zM156 102h4v4h-4zM149 109h4v4h-4z'} fill={shade(skin,.3)}/>}
 {face.includes('moles')&&<path d="M152 110h4v4h-4z" fill={shade(skin,.5)}/>}
 </g>)}
 {part('top','top',null)}
 {part('bottoms','bottoms',null)}
 {part('socks','shoes',null)}
 {part('shoes','shoes',null)}
 {part('bottoms-cuff','bottoms',null)}
 {part('outerwear','outerwear',null)}
 {part('chin-shadow',null,null)}
 {part('hair-front','hair',<><defs><clipPath id={`${clipId}-arms`}><path clipRule="evenodd" d={`M-400 -400h1200v1200h-1200z${armHoles}`}/></clipPath></defs><g fill={hairColor} clipPath={`url(#${clipId}-arms)`}>{!back&&hairPieces.front.length>0&&<g clipPath={`url(#${clipId})`} fill={shade(skin,.3)} opacity={Math.abs(lum(hairColor)-lum(skin))<.14?.95:.5}><clipPath id={clipId}><path d={side?headSkull.side:headSkull.front}/></clipPath>{[[0,3],[3,0],[-3,0]].map(([dx,dy])=><path key={`${dx}${dy}`} d={boxPath(hairPieces.front)} transform={`translate(${dx} ${dy})`}/>)}</g>}<path d={boxPath(hairPieces.front)}/>{hairPieces.stub&&<path d={boxPath(hairPieces.stub)} opacity=".38"/>}<path d={boxPath(hairPieces.light)} fill={shade(hairColor,-.22)}/><path d={boxPath(hairPieces.tie)} fill={shade(hairColor,.4)}/></g></>)}
 {part('headwear',has(head)?'headwear':['cap','visor','helmet'].includes(legacy)?'accessory':null,(has(head)||['cap','visor','helmet'].includes(legacy))&&(()=>{const c=has(head)?color('headwear','#788f79'):color('accessory','#788f79');return <g fill={c}><path d={boxPath(hat.main)}/><path d={boxPath(hat.accent)} fill={shade(c,-.28)}/><path d={boxPath(hat.dark)} fill={shade(c,.34)}/></g>;})())}
 {part('face-accessory',has(glasses)?'faceAccessory':['glasses','goggles'].includes(legacy)?'accessory':null,!back&&(has(glasses)||['glasses','goggles'].includes(legacy))&&(()=>{const c=has(glasses)?color('faceAccessory','#3d4c47'):color('accessory','#3d4c47');return <g fill={c}><path d={boxPath(spec.rim)}/><path d={boxPath(spec.lens)} fill={shade(c,.45)}/><path d={boxPath(spec.shine)} fill="#f1ecdb" opacity=".8"/></g>;})())}
 {part('neck-accessory','accessory',legacy&&!['none','cap','visor','helmet','glasses','goggles','satchel','backpack'].includes(legacy)&&<g fill={color('accessory','#bd9b63')}><path d={legacy.includes('scarf')||legacy.includes('bandana')?'M102 134h52v22H102zM134 156h20v64h-20z':legacy.includes('wrist')||legacy.includes('watch')?'M60 228h22v10H60zM174 228h22v10H174z':legacy.includes('earrings')?'M80 106h6v12h-6zM172 106h6v12h-6z':'M104 136h6v20h36v-20h6v26H104zM120 162h18v22h-18z'}/></g>)}
 {part('back-item',has(bag)?'backItem':['backpack','satchel'].includes(legacy)?'accessory':null,(has(bag)||['backpack','satchel'].includes(legacy))&&(()=>{const c=has(bag)?color('backItem','#a08560'):color('accessory','#a08560');const l=rig.anchors.leftShoulder.x,r=rig.anchors.rightShoulder.x,y=rig.anchors.leftShoulder.y,hem=rig.hem;return <g fill={c}>
  {back?<><path d={`M${l+2} ${y+14}h${r-l-4}v${hem-y+4}h${-(r-l-4)}z`}/><path d={`M${l+10} ${y+4}h${r-l-20}v12h${-(r-l-20)}z`}/>
   <path d={`M${l+12} ${y+44}h${r-l-24}v30h${-(r-l-24)}z`} fill="#f0dfba" opacity=".4"/><path d={`M122 ${y+52}h12v14h-12z`} fill="#5a6353"/></>
  :side?<><path d={`M${l-26} ${y+12}h26v${hem-y-4}h-26z`}/><path d={`M${l-10} ${y+2}h14v14h-14z`}/><path d={`M${l-22} ${y+40}h18v24h-18z`} fill="#f0dfba" opacity=".4"/></>
  :<><path d={`M${l+8} ${y+4}h13v${hem-y-10}h-13zM${r-21} ${y+4}h13v${hem-y-10}h-13z`}/>
   <path d={`M${l-24} ${y+18}h16v44h-16zM${r+8} ${y+18}h16v44h-16z`}/>
   <path d={`M${l+8} ${y+30}h13v6h-13zM${r-21} ${y+30}h13v6h-13z`} fill="#5a6353" opacity=".5"/>
   <path d={`M${l-20} ${y+26}h9v28h-9zM${r+12} ${y+26}h9v28h-9z`} fill="#f0dfba" opacity=".4"/></>}
 </g>;})())}
 {part('held-item','prop',<g>{prop==='prop-racquet'&&<g><path d="M204 132h22v8h10v50h-10v8h-8v54h-10V198h-10v-8h-10V140h16z" fill="#b98375"/><path d="M202 146h20v38h-20z" fill="#c6d4b3"/>{[206,212,218].map(x=><path key={x} d={`M${x} 146h2v38h-2z`} fill="#718f73"/>)}{[154,164,174].map(y=><path key={y} d={`M202 ${y}h20v2h-20z`} fill="#718f73"/>)}</g>}{prop==='prop-notebook'&&<g><path d="M188 204h46v60H188z" fill="#a08bac"/><path d="M194 204h4v60h-4zM206 220h18v4h-18zM206 230h14v2h-14z" fill="#e7e0ca"/></g>}{prop==='prop-quill'&&<g><path d="M206 108h16v10h12v38h-10v18h-12v18h-12v42h-4V178h-8V140h8V118h10z" fill="#eae1c7"/><path d="M208 126h4v102h-4zM210 150h14v2h-14zM196 160h12v2h-12z" fill="#998666"/></g>}{prop==='prop-pen-sword'&&<g><path d="M206 100h6v10h8v106h-22V110h8z" fill="#a998c5"/><path d="M206 114h6v98h-6z" fill="#e6dfca"/><path d="M192 216h40v10H192zM202 226h16v44h-16z" fill="#b69c58"/><path d="M206 234h8v2h-8zM206 244h8v2h-8z" fill="#675848"/></g>}{prop==='prop-toolbelt'&&<g><path d="M82 234h96v10H82zM88 244h24v30H88zM146 244h24v30H146z" fill="#9c7c53"/><path d="M96 234h6v32h-6zM152 234h6v32h-6zM90 228h18v6h-18z" fill="#c4ccc1"/></g>}{prop.includes('pump')&&<path d="M198 168h12v86h-12zM184 164h40v10H184zM194 254h24v6H194z" fill="#596f6f"/>}{prop.includes('tube')&&<g><path d="M196 174h24v94H196z" fill="#9ba77a"/><path d="M194 174h28v8H194zM194 260h28v8H194z" fill="#d6cc94"/></g>}{prop.includes('bag')&&<path d="M198 148h20v10h12v102H192V160h6z" fill="#748e7b"/>}{prop.includes('board')&&<g><path d="M194 178h36v10h8v70H186V188h8z" fill="#ccad74"/><path d="M198 196h8v16h-8zM220 196h8v16h-8z" fill="#9b8b69"/></g>}{prop.includes('towel')&&<g><path d="M192 194h40v80H192z" fill="#94b7b5"/><path d="M192 258h40v6H192z" fill="#e9debd"/></g>}{prop.includes('wheel')&&<g fill="none" stroke="#5e7168" strokeWidth="4"><path d="M206 236h26l12 14v30l-12 14h-26l-12-14v-30zM194 264h50M220 236v58M202 246l36 38M238 246l-36 38"/></g>}</g>)}
 {part('foreground-effect','prop',<g>{prop==='prop-ball'&&<g><path d="M202 290h22v6h6v22h-6v6h-22v-6h-6v-22h6z" fill="#ceca75"/><path d="M206 290v12h-6M220 324v-10h8" fill="none" stroke="#ece6bc" strokeWidth="2"/></g>}{prop==='prop-water-trail'&&[44,190,212].map((x,i)=><path key={x} d={`M${x} ${308+i*18}h4v6h4v12h-12v-12h4z`} fill="#78abae"/>)}{prop==='prop-page-aura'&&[36,204,46].map((x,i)=><g key={i}><path d={`M${x} ${164+i*64}h20v26h-20z`} fill="#eae2ca"/><path d={`M${x+4} ${172+i*64}h12v2h-12z`} fill="#9c9e83"/></g>)}</g>)}
 </g></svg>;
}
