'use client';
import {useEffect,useState,type ReactNode,type PointerEvent} from 'react';
import {bodyRigs,type BodyRigId} from '@/lib/body-rigs';
import {RigLayer} from './rig-layers';
import {avatarItems} from '@/lib/content';
import {tints,type TintId} from '@/lib/tints';
import {hairArt,boxPath} from '@/lib/hair';
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
 const headTransform=`translate(0 ${headDrop+rig.headOffset+seat}) translate(128 ${NECK}) scale(${HEAD_SCALE}) translate(-128 ${-NECK})`;
 const hand={x:128+(rig.anchors.rightHand.x-128)*BODY_W,y:GROUND+(rig.anchors.rightHand.y-GROUND)*BODY_H};
 const grip=propGrips.find(([k])=>prop.includes(k))?.[1]||[200,230];
 const heldTransform=`translate(${hand.x} ${hand.y}) scale(${PROP_SCALE}) translate(${-grip[0]} ${-grip[1]})`;
 const part=(name:string,slot:string|null,children:ReactNode)=>{const headLayer=['head','face','hair-back','hair-front','headwear','face-accessory'].includes(name);const held=name==='held-item'&&!prop.includes('toolbelt');const attachment=name==='back-item'?{x:rig.anchors.back.x-192,y:rig.anchors.back.y-206}:name==='neck-accessory'?{x:0,y:rig.headOffset}:null;return <g data-layer={name} data-slot={slot||undefined} transform={name==='shadow'?undefined:held?heldTransform:headLayer?headTransform:attachment?`${bodyTransform} translate(${attachment.x} ${attachment.y})`:bodyTransform} data-highlighted={interactive&&slot===hover?'true':undefined} className={interactive&&slot?'editable-pixels':undefined}>{['head','body','top','bottoms','bottoms-cuff','socks','shoes','outerwear','chin-shadow'].includes(name)?<RigLayer tone={tone} layer={name} rig={rig} side={side} back={back} id={selection[slot||'']||''} color={color(slot||'','#819776')} skin={skin}/>:children}</g>;};
 function pointer(e:PointerEvent<SVGSVGElement>,activate:boolean){if(!interactive)return;const slot=(e.target as Element).closest('[data-slot]')?.getAttribute('data-slot')||null;setHover(slot);onPart?.(slot,activate,e.pointerType==='touch');}
 const description=['top','bottoms','shoes','hair','headwear','faceAccessory','backItem','prop'].map(s=>item(s)?.name).filter(n=>n&&!n.toLowerCase().startsWith('no ')&&n!=='none').join(', ');
 const hairPieces=hairArt(hair,back?'back':side?'side':'front');
 const hat=hatArt(head,legacy||'',back?'back':side?'side':'front'),spec=glassArt(glasses,legacy||'',side);
 const eyes=[107,149],lash='#3a2f26',iris=color('eyeColor',{'color-espresso':'#7d5730','color-chestnut':'#9c6f37','color-gold':'#c8942f','color-silver':'#6c8b99','color-copper':'#6a8f4e','color-ink':'#46566a'}[selection.hairColor||'']||'#7d5730');
 const closedEyes=face.includes('calm')||face.includes('tired');
 /** Brows carry most of the expression, so every face has them; the shape is what varies. */
 const browShape=face.includes('focused')?'focused':face.includes('curious')?'curious'
  :face.includes('victory')||face.includes('happy')||face.includes('bright')?'raised'
  :face.includes('tired')||face.includes('calm')?'soft':'neutral';
 const heavy=face.includes('brows');
 // Brows live between the hairline at y56 and the upper lash at y73.
 const brow=(cx:number)=>{const out=cx<128?-1:1,t=heavy?6:5;
  if(browShape==='soft')return [[cx-11,68,22,t-1]];
  if(browShape==='raised')return [[cx-12,63,24,t],[cx-5,60,12,3]];
  if(browShape==='focused')return [[cx-12,62,24,t],[cx+(out<0?4:-14),66,10,t]];
  if(browShape==='curious'&&cx<128)return [[cx-12,60,24,t],[cx-5,57,12,3]];
  return [[cx-12,66,24,t]];};
 return <svg className={`avatar pixel-art ${large?'large':''}`} data-rig={bodyRigId} data-animation={animation} data-pose={pose} data-paused={hidden} viewBox={viewBox} role={decorative?'presentation':'img'} aria-hidden={decorative||undefined} aria-label={decorative?undefined:`Pixel character wearing ${description}`} shapeRendering="crispEdges" onPointerMove={e=>{if(e.pointerType!=='touch')pointer(e,false);}} onPointerDown={e=>pointer(e,true)} onPointerLeave={e=>{if(e.pointerType==='touch')return;setHover(null);onPart?.(null,false,false);}}>
 {part('shadow',null,<path d="M86 354h84v4H86zM70 358h116v6H70zM62 364h132v5H62zM74 369h108v4H74zM92 373h72v3H92z" fill="var(--season-shadow,#53634e)" opacity=".28"/>)}
 <g className="avatar-idle">
 {part('body','body',null)}
 {part('hair-back','hair',<g fill={hairColor}><path d={boxPath(hairPieces.back)}/></g>)}
 {part('head','body',null)}
 {part('face','face',!back&&<g>{side?closedEyes?<path d="M151 88h16v4h-16zM148 85h3v3h-3zM167 85h3v3h-3z" fill={lash}/>:<>
  <path d="M152 80h14v15h-14zM154 95h10v3h-10z" fill="#f8f4e8"/>
  <path d="M156 81h10v13h-10zM158 94h6v3h-6z" fill={iris}/><path d="M158 91h8v4h-8z" fill={shade(iris,-.28)}/><path d="M159 83h5v8h-5z" fill="#241d18"/>
  <path d="M151 77h16v4h-16zM153 74h12v3h-12zM150 81h3v4h-3zM166 74h3v5h-3z" fill={lash}/><path d="M156 82h3v3h-3z" fill="#fffdf5"/>
  <g className="avatar-lid"><path d="M151 77h16v21h-16z" fill={skin}/><path d="M152 88h14v4h-14z" fill={lash}/></g>
 </>:eyes.map(cx=>closedEyes
  ?<path key={cx} d={`M${cx-10} 88h20v5h-20zM${cx-13} 85h4v3h-4zM${cx+9} 85h4v3h-4zM${cx-16} 82h3v3h-3zM${cx+13} 82h3v3h-3z`} fill={lash}/>
  :(cx=>{const out=cx<128?-1:1;return <g key={cx}>
    <path d={`M${cx-10} 78h20v17h-20zM${cx-8} 95h16v4h-16z`} fill="#f8f4e8"/>
    <path d={`M${cx-8} 79h16v14h-16zM${cx-6} 93h12v4h-12z`} fill={iris}/>
    <path d={`M${cx-6} 90h12v5h-12z`} fill={shade(iris,-.28)}/>
    <path d={`M${cx-3} 82h6v9h-6zM${cx-2} 80h4v13h-4z`} fill="#241d18"/>
    {/* The dark line is an upper lash, not a ring: nothing outlines the lower lid. */}
    <path d={`M${cx-10} 76h20v5h-20zM${cx-8} 73h16v3h-16zM${cx-11} 80h3v5h-3zM${cx+8} 80h3v5h-3zM${cx+(out<0?-14:11)} 73h3v6h-3z`} fill={lash}/>
    <path d={`M${cx-6} 81h4v4h-4zM${cx+3} 90h3v3h-3z`} fill="#fffdf5"/>
    <g className="avatar-lid"><path d={`M${cx-11} 76h22v24h-22z`} fill={skin}/><path d={`M${cx-10} 88h20v5h-20z`} fill={lash}/></g>
   </g>;})(cx))}
  {/* When hair and skin sit at the same value the brow disappears into both, so push it away from
  them — lighter on dark skin, darker on light. Espresso hair on ebony skin was the case that failed. */}
 <path d={side?boxPath(browShape==='raised'?[[150,61,20,5],[156,58,10,3]]:browShape==='soft'?[[151,68,18,4]]:[[150,65,20,5]]):boxPath(eyes.flatMap(cx=>brow(cx)) as [number,number,number,number][])} fill={Math.abs(lum(hairColor)-lum(skin))<.14?shade(hairColor,lum(skin)<.45?-.5:.35):shade(hairColor,.15)}/>
 {/* A soft blush on every face; the rosy variant just turns it up. */}
 <path d={side?'M152 102h12v7h-12zM150 104h16v3h-16z':'M94 101h12v9H94zM92 103h16v5H92zM150 101h12v9h-12zM148 103h16v5h-16z'} fill="#d0766e" opacity={face.includes('rosy')?.45:lum(skin)<.35?.3:.17}/>
 <path d={side?'M170 108h8v4h-8z':'M124 105h8v4h-8zM122 109h12v4h-12z'} fill={shade(skin,.24)}/>{!side&&<path d="M126 106h5v2h-5z" fill={shade(skin,-.14)}/>}
 <path d={side?'M160 120h11v5h-11zM155 116h5v4h-5z':face.includes('victory')?'M116 118h24v6h-24zM120 124h16v5h-16z':face.includes('happy')||face.includes('bright')?'M118 120h20v4h-20zM114 116h5v4h-5zM137 116h5v4h-5zM110 112h4v4h-4zM142 112h4v4h-4z':'M119 120h18v4h-18z'} fill={lash}/>
 {face.includes('victory')&&!side&&<path d="M122 125h12v3h-12z" fill="#c07a72"/>}
  {face.includes('freckles')&&<path d={side?'M150 104h4v4h-4zM158 110h4v4h-4z':'M96 102h4v4h-4zM103 109h4v4h-4zM111 103h3v3h-3zM156 102h4v4h-4zM149 109h4v4h-4z'} fill={shade(skin,.3)}/>}
 {face.includes('moles')&&<path d="M152 113h4v4h-4z" fill={shade(skin,.5)}/>}
 </g>)}
 {part('top','top',null)}
 {part('bottoms','bottoms',null)}
 {part('socks','shoes',null)}
 {part('shoes','shoes',null)}
 {part('bottoms-cuff','bottoms',null)}
 {part('outerwear','outerwear',null)}
 {part('chin-shadow',null,null)}
 {part('hair-front','hair',<g fill={hairColor}><path d={boxPath(hairPieces.front)}/><path d={boxPath(hairPieces.light)} fill={shade(hairColor,-.22)}/><path d={boxPath(hairPieces.tie)} fill={shade(hairColor,.4)}/></g>)}
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
