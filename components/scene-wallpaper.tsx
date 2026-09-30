'use client';
import {useEffect,useRef,useState,type CSSProperties,type RefObject} from 'react';
import type {Application,Container,Filter} from 'pixi.js';
import {kit,type Pixi,type Updater} from '@/lib/wallpapers/kit';
import {meadow,fall,city,beach,scenes,surfStyles,type SceneId} from '@/lib/wallpapers';
import {surfboard} from '@/lib/wallpapers/surfboard';
/** One Pixi canvas for the desktop wallpaper (docs/design/retro-reference.html): the scene draws
 * into `world` under the CRT/dither shader; the surfboard draws into `fg`, outside it, and carries the
 * DOM character (`rider`) on its bob and roll. pixi.js is imported on the client only, after the
 * page has painted. The CSS gradient on the host shows whenever it cannot run or has not yet. */
const builders={meadow,fall,city,beach};
const CRT_FRAG=`precision highp float;
varying vec2 vTextureCoord;uniform sampler2D uSampler;uniform vec4 inputSize;uniform float uTime;
float bayer2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}
float bayer4(vec2 a){return bayer2(.5*a)*.25+bayer2(a);}
float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 px=inputSize.zw*2.0;vec2 uv=(floor(vTextureCoord/px)+0.5)*px;float ca=inputSize.z*2.0;
 vec4 c=texture2D(uSampler,uv);c.r=texture2D(uSampler,uv+vec2(ca,0.0)).r;c.b=texture2D(uSampler,uv-vec2(ca,0.0)).b;
 vec2 p=floor(vTextureCoord*inputSize.xy/2.0);float L=14.0;vec3 col=floor(c.rgb*L+(bayer4(p)-0.5)+0.5)/L;
 col+=(rand(p+fract(uTime*7.0))-0.5)*0.04;gl_FragColor=vec4(col,1.0);}`;
type Engine={build:number;app:Application;PIXI:Pixi;world:Container;fg:Container;crt:Filter;sceneAnim:Updater[];boardAnim:Updater[];clock:{T:number};buildScene:()=>Promise<void>;buildBoard:()=>void;sync:()=>void};
export function SceneWallpaper({scene,board,rider,still=false,paused=false,className='',data,style}:{style?:CSSProperties;scene:SceneId;board?:{x:number;y:number};rider?:RefObject<HTMLElement|null>;still?:boolean;paused?:boolean;className?:string;data?:Record<string,string|number|boolean>}){
 const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null);
 // hidden tab and OS reduced motion, mirrored into state so data-paused / data-still are right before Pixi loads
 const [hidden,setHidden]=useState(false),[reduced,setReduced]=useState(false);
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>{setHidden(document.hidden);setReduced(mq.matches);};update();document.addEventListener('visibilitychange',update);mq.addEventListener('change',update);return()=>{document.removeEventListener('visibilitychange',update);mq.removeEventListener('change',update);};},[]);
 const isStill=still||reduced;
 const props=useRef({scene,board,rider,still,paused});
 useEffect(()=>{props.current={scene,board,rider,still:isStill,paused};});   // first effect: the ones below read the latest props
 useEffect(()=>{const el=host.current;if(!el)return;let dead=false,cleanup=()=>{};
  // no GPU behind WebGL (SwiftShader, llvmpipe, no WebGL at all): keep the CSS gradient. Building and running the
  // scene in software costs seconds per page and starves everything else on it.
  const probe=document.createElement('canvas').getContext('webgl'),info=probe?.getExtension('WEBGL_debug_renderer_info');
  const software=!probe||/swiftshader|llvmpipe|software/i.test(info?String(probe.getParameter(info.UNMASKED_RENDERER_WEBGL)):'');probe?.getExtension('WEBGL_lose_context')?.loseContext();
  if(software){el.dataset.render='fallback';return;}
  const start=()=>void import('pixi.js').then(PIXI=>{if(dead)return;let app:Application;
   try{app=new PIXI.Application({resizeTo:el,antialias:false,resolution:1,backgroundAlpha:0});}catch{return;/* no WebGL: the CSS gradient stays */}
   el.appendChild(app.view as HTMLCanvasElement);
   const world=new PIXI.Container(),fg=new PIXI.Container();app.stage.addChild(world,fg); // world = pixel-shaded scene, fg = crisp foreground
   const crt=new PIXI.Filter(undefined,CRT_FRAG,{uTime:0});if(!(window as never as {__nc?:boolean}).__nc)world.filters=[crt];world.filterArea=app.screen;
   const clear=(l:Container)=>l.removeChildren().forEach(c=>c.destroy({children:true,texture:true,baseTexture:true}));
   const e:Engine={build:0,app,PIXI,world,fg,crt,sceneAnim:[],boardAnim:[],clock:{T:0},
    async buildScene(){const id=++e.build;clear(world);world.visible=false;const {scene}=props.current,k=kit(PIXI,world,app.screen.width,app.screen.height,scene,app.renderer);k.clock=e.clock;builders[scene](k);e.sceneAnim=k.anim;e.buildBoard();
     await k.bake(()=>e.build===id&&engine.current===e);if(e.build!==id||engine.current!==e)return;world.visible=true;e.sync();el.dataset.ready='true';},
    buildBoard(){clear(fg);e.boardAnim=[];const {scene,board,rider}=props.current;const r=rider?.current;if(r){r.style.translate='';r.style.rotate='';}
     if(!board||!r||(window as never as {__nb?:boolean}).__nb)return;const k=kit(PIXI,fg,app.screen.width,app.screen.height,`surf-${scene}`);
     surfboard(PIXI,fg,{W:app.screen.width,cx:board.x,cy:board.y,st:surfStyles[scene],rnd:k.rnd,anim:e.boardAnim,clock:e.clock,onRide:(dy,roll)=>{r.style.translate=`0 ${dy}px`;r.style.rotate=`${roll}rad`;}});},
    /** Still (reduced motion, animation off): one frame, no bob, roll, shine, trail or glint. Paused/hidden: frozen. */
    sync(){const {paused}=props.current,still=props.current.still||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='reduced';if(still){app.ticker.stop();const r=props.current.rider?.current;if(r){r.style.translate='';r.style.rotate='';}app.render();return;}
     if(paused||document.hidden)app.ticker.stop();else app.ticker.start();}};
   engine.current=e;void e.buildScene();
   // ponytail: 12fps, a stepped retro drift. Software-GL browsers spend 60-80ms a frame here, so 30fps starved the page; raise on real GPUs if wanted
   app.ticker.maxFPS=12;
   app.ticker.add(d=>{const dt=Math.min(d/60,.1);e.clock.T+=dt;crt.uniforms.uTime=e.clock.T;e.sceneAnim.forEach(f=>f(dt));e.boardAnim.forEach(f=>f(dt));});
   e.sync();el.dataset.render='live';
   let timer=0;const resize=new ResizeObserver(()=>{clearTimeout(timer);timer=window.setTimeout(()=>{app.resize();void e.buildScene();},200);});resize.observe(el);
   const visibility=()=>e.sync();document.addEventListener('visibilitychange',visibility);
   cleanup=()=>{clearTimeout(timer);resize.disconnect();document.removeEventListener('visibilitychange',visibility);const r=props.current.rider?.current;if(r){r.style.translate='';r.style.rotate='';}engine.current=null;app.destroy(true,{children:true,texture:true,baseTexture:true});};});
  // built when the main thread is idle, so the page's own content paints first
  const idle=window.requestIdleCallback?.(start,{timeout:2500})??window.setTimeout(start,800);
  return()=>{dead=true;window.cancelIdleCallback?.(idle);clearTimeout(idle);cleanup();};},[]);
 useEffect(()=>{const e=engine.current;if(!e)return;void e.buildScene();const el=host.current;if(el&&!props.current.still){el.classList.remove('switch');void el.offsetWidth;el.classList.add('switch');}},[scene]);
 useEffect(()=>{const e=engine.current;if(!e)return;e.buildBoard();e.sync();},[board?.x,board?.y]);
 useEffect(()=>{engine.current?.sync();},[isStill,paused,hidden]);
 return <div ref={host} className={`scene-wallpaper ${className}`} data-scene={scene} data-still={isStill} data-paused={paused||hidden||isStill} {...Object.fromEntries(Object.entries(data||{}).map(([k,v])=>[`data-${k}`,String(v)]))} aria-hidden="true" style={{background:scenes[scene].prev,...style} as CSSProperties}/>;}
