'use client';
import {useEffect,useState,type ReactNode,type PointerEvent} from 'react';
import {bodyRigs,type BodyRigId} from '@/lib/body-rigs';
import {RigLayer} from './rig-layers';
import {avatarItems} from '@/lib/content';
import {hairArt,boxPath} from '@/lib/hair';
import {hatArt,glassArt} from '@/lib/headwear';
export type AvatarPose='front'|'left'|'right'|'back';
/** Ground and neck in authored canvas units, then how far each half is pushed from there. */
const GROUND=364,NECK=140,HEAD_SCALE=2,BODY_W=.8,BODY_H=.48;
/** Original 256 × 384 paper doll. Painted SVG pixels are also the hit masks:
 * browser hit testing returns the topmost painted shape, never its transparent box. */
export function Avatar({selection,large=false,pose='front',onPart,interactive=false,bodyRigId='average-average',animation='idle',viewBox='0 0 256 384',decorative=false}:{selection:Record<string,string>;bodyRigId?:BodyRigId;animation?:'idle'|'gesture'|'celebration';large?:boolean;pose?:AvatarPose;onPart?:(slot:string|null,activate:boolean,touch:boolean)=>void;interactive?:boolean;viewBox?:string;decorative?:boolean}){
 const [hover,setHover]=useState<string|null>(null),[hidden,setHidden]=useState(false);
 useEffect(()=>{const update=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 const item=(slot:string)=>avatarItems.find(i=>i.id===selection[slot]);const color=(slot:string,fallback:string)=>item(slot)?.color||fallback;
 const shade=(hex:string,amount:number)=>{const n=parseInt(hex.slice(1),16);const mix=(c:number)=>Math.max(0,Math.min(255,Math.round(c*(1-amount))));return `#${[(n>>16)&255,(n>>8)&255,n&255].map(c=>mix(c).toString(16).padStart(2,'0')).join('')}`;};
 const skin=color('body','#DCAE83'),hairColor=color('hairColor','#3F342F'),hair=selection.hair?.replace('hair-','')||'curls',legacy=selection.accessory,prop=selection.prop||'prop-none',back=pose==='back',side=pose==='left'||pose==='right';
 const face=selection.face||'face-bright',head=selection.headwear||'',glasses=selection.faceAccessory||'',bag=selection.backItem||'';
 const rig=bodyRigs[bodyRigId]||bodyRigs['average-average'];
 const has=(s:string)=>!!s&&!s.endsWith('-none');
 /** Chibi proportions without touching a single authored path: the head scales up about the neck,
  * the body scales down about the feet, and both meet at the same neck point. Every rig, clothing
  * pattern and attachment follows automatically because they are all derived from rig anchors. */
 const neckY=NECK+rig.headOffset,headDrop=GROUND+(neckY-GROUND)*BODY_H-neckY;
 const bodyTransform=`translate(128 ${GROUND}) scale(${BODY_W} ${BODY_H}) translate(-128 ${-GROUND})`;
 const headTransform=`translate(0 ${headDrop+rig.headOffset}) translate(128 ${NECK}) scale(${HEAD_SCALE}) translate(-128 ${-NECK})`;
 const part=(name:string,slot:string|null,children:ReactNode)=>{const headLayer=['head','face','hair-back','hair-front','headwear','face-accessory'].includes(name);const attachment=name==='back-item'?{x:rig.anchors.back.x-192,y:rig.anchors.back.y-206}:name==='held-item'&&!prop.includes('toolbelt')?{x:Math.min(12,rig.anchors.rightHand.x-188),y:rig.anchors.rightHand.y-252}:name==='neck-accessory'?{x:0,y:rig.headOffset}:null;return <g data-layer={name} data-slot={slot||undefined} transform={name==='shadow'?undefined:headLayer?headTransform:attachment?`${bodyTransform} translate(${attachment.x} ${attachment.y})`:bodyTransform} data-highlighted={interactive&&slot===hover?'true':undefined} className={interactive&&slot?'editable-pixels':undefined}>{['head','body','top','bottoms','socks','shoes','outerwear'].includes(name)?<RigLayer layer={name} rig={rig} side={side} back={back} id={selection[slot||'']||''} color={color(slot||'','#819776')} skin={skin}/>:children}</g>;};
 function pointer(e:PointerEvent<SVGSVGElement>,activate:boolean){if(!interactive)return;const slot=(e.target as Element).closest('[data-slot]')?.getAttribute('data-slot')||null;setHover(slot);onPart?.(slot,activate,e.pointerType==='touch');}
 const description=['top','bottoms','shoes','hair','headwear','faceAccessory','backItem','prop'].map(s=>item(s)?.name).filter(n=>n&&!n.toLowerCase().startsWith('no ')&&n!=='none').join(', ');
 const hairPieces=hairArt(hair,back?'back':side?'side':'front');
 const hat=hatArt(head,legacy||'',back?'back':side?'side':'front'),spec=glassArt(glasses,legacy||'',side);
 const eyes=[107,149],lash='#3a2f26',iris=color('eyeColor',{'color-espresso':'#7d5730','color-chestnut':'#9c6f37','color-gold':'#c8942f','color-silver':'#6c8b99','color-copper':'#6a8f4e','color-ink':'#46566a'}[selection.hairColor||'']||'#7d5730');
 const closedEyes=face.includes('calm')||face.includes('tired');
 const brows=face.includes('focused')||face.includes('curious')||face.includes('brows');
 return <svg className={`avatar pixel-art ${large?'large':''}`} data-rig={bodyRigId} data-animation={animation} data-pose={pose} data-paused={hidden} viewBox={viewBox} role={decorative?'presentation':'img'} aria-hidden={decorative||undefined} aria-label={decorative?undefined:`Pixel character wearing ${description}`} shapeRendering="crispEdges" onPointerMove={e=>{if(e.pointerType!=='touch')pointer(e,false);}} onPointerDown={e=>pointer(e,true)} onPointerLeave={e=>{if(e.pointerType==='touch')return;setHover(null);onPart?.(null,false,false);}}>
 {part('shadow',null,<path d="M86 354h84v4H86zM70 358h116v6H70zM62 364h132v5H62zM74 369h108v4H74zM92 373h72v3H92z" fill="var(--season-shadow,#53634e)" opacity=".28"/>)}
 <g className="avatar-idle">
 {part('body','body',null)}
 {part('head','body',null)}
 {part('face','face',!back&&<g>{side?<>
  <path d="M150 76h17v22h-17z" fill={lash}/><path d="M152 78h14v18h-14z" fill="#f8f4e8"/>
  <path d="M154 78h12v18h-12z" fill={iris}/><path d="M154 78h12v4h-12z" fill={shade(iris,.35)}/><path d="M154 90h12v5h-12z" fill={shade(iris,-.28)}/><path d="M157 82h6v10h-6z" fill="#241d18"/><path d="M154 79h4v4h-4z" fill="#fffdf5"/>
  <g className="avatar-lid"><path d="M150 76h17v22h-17z" fill={skin}/><path d="M151 86h15v4h-15z" fill={lash}/></g>
 </>:eyes.map(cx=>closedEyes
  ?<path key={cx} d={`M${cx-12} 88h24v5h-24zM${cx-16} 84h5v4h-5zM${cx+11} 84h5v4h-5zM${cx-19} 80h4v4h-4zM${cx+15} 80h4v4h-4z`} fill={lash}/>
  :<g key={cx}>
    <path d={`M${cx-14} 76h28v22h-28zM${cx-11} 72h22v30h-22z`} fill={lash}/>
    <path d={`M${cx-12} 78h24v18h-24zM${cx-9} 74h18v26h-18z`} fill="#f8f4e8"/>
    <path d={`M${cx-10} 80h20v12h-20zM${cx-8} 77h16v19h-16zM${cx-6} 75h12v23h-12z`} fill={iris}/>
    <path d={`M${cx-8} 75h16v5h-16z`} fill={shade(iris,.35)}/>
    <path d={`M${cx-6} 90h12v7h-12z`} fill={shade(iris,-.28)}/>
    <path d={`M${cx-4} 83h8v9h-8zM${cx-3} 81h6v13h-6z`} fill="#241d18"/>
    <path d={`M${cx-6} 79h6v6h-6zM${cx+2} 90h4v4h-4z`} fill="#fffdf5"/>
    <g className="avatar-lid"><path d={`M${cx-14} 72h28v30h-28z`} fill={skin}/><path d={`M${cx-13} 86h26v5h-26z`} fill={lash}/></g>
   </g>)}
 {brows&&<path d={side?'M150 64h20v5h-20z':face.includes('curious')?'M95 58h24v5H95zM137 64h24v5h-24z':'M95 62h24v5H95zM137 62h24v5h-24z'} fill={shade(hairColor,.15)}/>}
 <path d={side?'M170 108h8v4h-8z':'M124 105h8v4h-8zM122 109h12v4h-12z'} fill={shade(skin,.24)}/>{!side&&<path d="M126 106h5v2h-5z" fill={shade(skin,-.14)}/>}
 <path d={side?'M160 120h11v5h-11zM155 116h5v4h-5z':face.includes('victory')?'M116 118h24v6h-24zM120 124h16v5h-16z':face.includes('happy')||face.includes('bright')?'M118 120h20v4h-20zM114 116h5v4h-5zM137 116h5v4h-5zM110 112h4v4h-4zM142 112h4v4h-4z':'M119 120h18v4h-18z'} fill={lash}/>
 {face.includes('victory')&&!side&&<path d="M122 125h12v3h-12z" fill="#c07a72"/>}
 {face.includes('rosy')&&<path d={side?'M150 102h14v9h-14z':'M92 100h16v9H92zM148 100h16v9h-16z'} fill="#d0766e" opacity=".5"/>}
 {face.includes('freckles')&&<path d={side?'M150 104h4v4h-4zM158 110h4v4h-4z':'M96 102h4v4h-4zM103 109h4v4h-4zM111 103h3v3h-3zM156 102h4v4h-4zM149 109h4v4h-4z'} fill={shade(skin,.3)}/>}
 {face.includes('moles')&&<path d="M152 113h4v4h-4z" fill={shade(skin,.5)}/>}
 </g>)}
 {part('hair-back','hair',<g fill={hairColor}><path d={boxPath(hairPieces.back)}/></g>)}
 {part('top','top',null)}
 {part('bottoms','bottoms',null)}
 {part('socks','shoes',null)}
 {part('shoes','shoes',null)}
 {part('outerwear','outerwear',null)}
 {part('hair-front','hair',<g fill={hairColor}><path d={boxPath(hairPieces.front)}/><path d={boxPath(hairPieces.light)} fill={shade(hairColor,-.22)}/><path d={boxPath(hairPieces.tie)} fill={shade(hairColor,.4)}/></g>)}
 {part('headwear',has(head)?'headwear':['cap','visor','helmet'].includes(legacy)?'accessory':null,(has(head)||['cap','visor','helmet'].includes(legacy))&&(()=>{const c=has(head)?color('headwear','#788f79'):color('accessory','#788f79');return <g fill={c}><path d={boxPath(hat.main)}/><path d={boxPath(hat.accent)} fill={shade(c,-.28)}/><path d={boxPath(hat.dark)} fill={shade(c,.34)}/></g>;})())}
 {part('face-accessory',has(glasses)?'faceAccessory':['glasses','goggles'].includes(legacy)?'accessory':null,!back&&(has(glasses)||['glasses','goggles'].includes(legacy))&&(()=>{const c=has(glasses)?color('faceAccessory','#3d4c47'):color('accessory','#3d4c47');return <g fill={c}><path d={boxPath(spec.rim)}/><path d={boxPath(spec.lens)} fill={shade(c,.45)}/><path d={boxPath(spec.shine)} fill="#f1ecdb" opacity=".8"/></g>;})())}
 {part('neck-accessory','accessory',legacy&&!['none','cap','visor','helmet','glasses','goggles','satchel','backpack'].includes(legacy)&&<g fill={color('accessory','#bd9b63')}><path d={legacy.includes('scarf')||legacy.includes('bandana')?'M106 140h44v16H106zM136 156h16v58h-16z':legacy.includes('wrist')||legacy.includes('watch')?'M60 228h22v10H60zM174 228h22v10H174z':legacy.includes('earrings')?'M80 106h6v12h-6zM172 106h6v12h-6z':'M110 150h4v16h28v-16h4v20H110zM122 170h14v14h-14z'}/></g>)}
 {part('back-item',has(bag)?'backItem':['backpack','satchel'].includes(legacy)?'accessory':null,(has(bag)||['backpack','satchel'].includes(legacy))&&<g fill={has(bag)?color('backItem','#a08560'):color('accessory','#a08560')}><path d={back?'M86 162h86v92H86zM100 152h58v14H100z':bag.includes('kickboard')?'M166 154h36v8h8v86H164V162z':bag.includes('roll')?'M164 214h50v34H164z':'M172 170h36v14h8v66H168V184h4z'}/><path d={back?'M94 188h70v4H94zM102 208h54v36H102z':'M180 194h24v4H180zM176 212h28v28H176zM96 158h6v88h-6z'} fill="#f0dfba" opacity=".4"/><path d={back?'M126 206h6v10h-6z':'M188 210h6v10h-6z'} fill="#5a6353"/></g>)}
 {part('held-item','prop',<g>{prop==='prop-racquet'&&<g><path d="M204 132h22v8h10v50h-10v8h-8v54h-10V198h-10v-8h-10V140h16z" fill="#b98375"/><path d="M202 146h20v38h-20z" fill="#c6d4b3"/>{[206,212,218].map(x=><path key={x} d={`M${x} 146h2v38h-2z`} fill="#718f73"/>)}{[154,164,174].map(y=><path key={y} d={`M202 ${y}h20v2h-20z`} fill="#718f73"/>)}</g>}{prop==='prop-notebook'&&<g><path d="M188 204h46v60H188z" fill="#a08bac"/><path d="M194 204h4v60h-4zM206 220h18v4h-18zM206 230h14v2h-14z" fill="#e7e0ca"/></g>}{prop==='prop-quill'&&<g><path d="M206 108h16v10h12v38h-10v18h-12v18h-12v42h-4V178h-8V140h8V118h10z" fill="#eae1c7"/><path d="M208 126h4v102h-4zM210 150h14v2h-14zM196 160h12v2h-12z" fill="#998666"/></g>}{prop==='prop-pen-sword'&&<g><path d="M206 100h6v10h8v106h-22V110h8z" fill="#a998c5"/><path d="M206 114h6v98h-6z" fill="#e6dfca"/><path d="M192 216h40v10H192zM202 226h16v44h-16z" fill="#b69c58"/><path d="M206 234h8v2h-8zM206 244h8v2h-8z" fill="#675848"/></g>}{prop==='prop-toolbelt'&&<g><path d="M82 234h96v10H82zM88 244h24v30H88zM146 244h24v30H146z" fill="#9c7c53"/><path d="M96 234h6v32h-6zM152 234h6v32h-6zM90 228h18v6h-18z" fill="#c4ccc1"/></g>}{prop.includes('pump')&&<path d="M198 168h12v86h-12zM184 164h40v10H184zM194 254h24v6H194z" fill="#596f6f"/>}{prop.includes('tube')&&<g><path d="M196 174h24v94H196z" fill="#9ba77a"/><path d="M194 174h28v8H194zM194 260h28v8H194z" fill="#d6cc94"/></g>}{prop.includes('bag')&&<path d="M198 148h20v10h12v102H192V160h6z" fill="#748e7b"/>}{prop.includes('board')&&<g><path d="M194 178h36v10h8v70H186V188h8z" fill="#ccad74"/><path d="M198 196h8v16h-8zM220 196h8v16h-8z" fill="#9b8b69"/></g>}{prop.includes('towel')&&<g><path d="M192 194h40v80H192z" fill="#94b7b5"/><path d="M192 258h40v6H192z" fill="#e9debd"/></g>}{prop.includes('wheel')&&<g fill="none" stroke="#5e7168" strokeWidth="4"><path d="M206 236h26l12 14v30l-12 14h-26l-12-14v-30zM194 264h50M220 236v58M202 246l36 38M238 246l-36 38"/></g>}</g>)}
 {part('foreground-effect','prop',<g>{prop==='prop-ball'&&<g><path d="M202 290h22v6h6v22h-6v6h-22v-6h-6v-22h6z" fill="#ceca75"/><path d="M206 290v12h-6M220 324v-10h8" fill="none" stroke="#ece6bc" strokeWidth="2"/></g>}{prop==='prop-water-trail'&&[44,190,212].map((x,i)=><path key={x} d={`M${x} ${308+i*18}h4v6h4v12h-12v-12h4z`} fill="#78abae"/>)}{prop==='prop-page-aura'&&[36,204,46].map((x,i)=><g key={i}><path d={`M${x} ${164+i*64}h20v26h-20z`} fill="#eae2ca"/><path d={`M${x+4} ${172+i*64}h12v2h-12z`} fill="#9c9e83"/></g>)}</g>)}
 </g></svg>;
}
