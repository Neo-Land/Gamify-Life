'use client';
import {useEffect,useRef} from 'react';
import type {SeasonalThemeId} from '@/lib/themes';
/** Painted procedural wallpaper behind the boot, login and setup screens (port of the reference's
 * Pixi v7 scene): sky, blurred clouds, hills, grass and flowers, tinted by season, then pixelated,
 * dithered and grained by one fragment shader. Loaded with `next/dynamic` so pixi.js never reaches
 * the server or the desktop bundle. The CSS gradient on `.retro-wallpaper` shows whenever this
 * cannot run: no WebGL, reduced motion, or before the chunk arrives. */
const tints:Record<SeasonalThemeId,{sky:[string,string,string];clouds:number[];hillBack:number;hill:number;grass:number[];dots:number;patch:[number,number]}>={
 spring:{sky:['#2f68cc','#5d9be6','#b9dcf6'],clouds:[0xffffff,0xffe4f2,0xd6f4ff,0xf6d0ec],hillBack:0x8fb86a,hill:0x5e9a3c,grass:[0x4c8a2e,0x6fae45,0x86c257,0x3e7426,0xa6d46a],dots:0xf6e05a,patch:[0x9a70c8,0xb890e0]},
 summer:{sky:['#1f5fc4','#3f95e8','#9fd8f4'],clouds:[0xffffff,0xf0f8ff,0xd6f4ff,0xe6f0ff],hillBack:0x7fb07a,hill:0x3f8a4a,grass:[0x2f7a3a,0x4e9a52,0x6cb865,0x2a6632,0x8fcf7a],dots:0xffffff,patch:[0x3a78d0,0x6ec6d8]},
 fall:{sky:['#6a5aa8','#d88a5a','#f6c890'],clouds:[0xfff0dc,0xffd8b8,0xf6c8a8,0xffe8c8],hillBack:0xc08a4a,hill:0x9a5a2a,grass:[0x8a4a1e,0xb86a2a,0xd8943c,0x6a3a18,0xe0b050],dots:0xd8404e,patch:[0xe08a3c,0xb02030]},
 winter:{sky:['#6a86b8','#a9bcd8','#e6eef6'],clouds:[0xffffff,0xeef4fa,0xdde8f4,0xf4f8ff],hillBack:0xc8d4e6,hill:0xe6eef6,grass:[0xb8c8dc,0xd8e2ee,0xf4f8ff,0xa0b4cc,0xffffff],dots:0x9cb8d8,patch:[0x8ea2c6,0xc6d4ea]}};
const CRT_FRAG=`precision highp float;
varying vec2 vTextureCoord;uniform sampler2D uSampler;uniform vec4 inputSize;uniform float uTime;
float bayer2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}
float bayer4(vec2 a){return bayer2(.5*a)*.25+bayer2(a);}
float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 px=inputSize.zw*2.0;vec2 uv=(floor(vTextureCoord/px)+0.5)*px;float ca=inputSize.z*2.0;
 vec4 c=texture2D(uSampler,uv);c.r=texture2D(uSampler,uv+vec2(ca,0.0)).r;c.b=texture2D(uSampler,uv-vec2(ca,0.0)).b;
 vec2 p=floor(vTextureCoord*inputSize.xy/2.0);float L=14.0;vec3 col=floor(c.rgb*L+(bayer4(p)-0.5)+0.5)/L;
 col+=(rand(p+fract(uTime*7.0))-0.5)*0.04;gl_FragColor=vec4(col,1.0);}`;
export default function Wallpaper({season}:{season:SeasonalThemeId}){const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=host.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='reduced')return;
  let dead=false,cleanup=()=>{};
  void import('pixi.js').then(PIXI=>{if(dead)return;const t=tints[season];let app:InstanceType<typeof PIXI.Application>;
   try{app=new PIXI.Application({resizeTo:el,antialias:false,resolution:1,backgroundColor:0x3f7fd6});}catch{return;/* no WebGL: the CSS gradient stays */}
   // 12fps: a stepped, retro drift, and cheap enough for software-GL browsers and the fanless Air
   app.ticker.maxFPS=12;el.appendChild(app.view as HTMLCanvasElement);
   const world=new PIXI.Container();app.stage.addChild(world);const crt=new PIXI.Filter(undefined,CRT_FRAG,{uTime:0});app.stage.filters=[crt];app.stage.filterArea=app.screen;
   const rnd=(a:number,b:number)=>a+Math.random()*(b-a);let clouds:{g:InstanceType<typeof PIXI.Sprite>;speed:number}[]=[];
   /** Blur filters are the expensive part, so everything is drawn once into textures: a back layer, each cloud, a front layer.
    * A frame then only moves nine sprites under the one dither pass. */
   const bake=(obj:InstanceType<typeof PIXI.Container>,region:InstanceType<typeof PIXI.Rectangle>)=>{const sprite=new PIXI.Sprite(app.renderer.generateTexture(obj,{region,resolution:1}));sprite.position.set(region.x,region.y);obj.destroy({children:true,texture:true,baseTexture:true});return sprite;};
   const build=()=>{world.removeChildren().forEach(c=>c.destroy({children:true,texture:true,baseTexture:true}));clouds=[];const W=app.screen.width,H=app.screen.height,full=new PIXI.Rectangle(0,0,W,H);
    const gc=document.createElement('canvas');gc.width=1;gc.height=256;const gx=gc.getContext('2d')!;const gr=gx.createLinearGradient(0,0,0,256);gr.addColorStop(0,t.sky[0]);gr.addColorStop(.45,t.sky[1]);gr.addColorStop(.8,t.sky[2]);gx.fillStyle=gr;gx.fillRect(0,0,1,256);
    const under=new PIXI.Container();const sky=new PIXI.Sprite(PIXI.Texture.from(gc));sky.width=W;sky.height=H;under.addChild(sky);
    const cu=new PIXI.Graphics();for(let i=0;i<60;i++)cu.beginFill(t.clouds[i%3?2:0],.55).drawCircle(W*rnd(.55,.95),H*rnd(.3,.58)-i*1.2,W*rnd(.02,.05)).endFill();cu.filters=[new PIXI.BlurFilter(22,4)];under.addChild(cu);
    world.addChild(bake(under,full));
    for(let n=0;n<9;n++){const g=new PIXI.Graphics(),s=rnd(.6,1.4);for(let i=0;i<16;i++)g.beginFill(t.clouds[i%4],rnd(.35,.7)).drawCircle(rnd(-90,90)*s,rnd(-25,25)*s-i*1.5,rnd(22,48)*s).endFill();g.filters=[new PIXI.BlurFilter(22,4)];
     const sprite=bake(g,new PIXI.Rectangle(-240,-150,480,300));sprite.position.set(rnd(0,W)-240,rnd(H*.05,H*.5)-150);world.addChild(sprite);clouds.push({g:sprite,speed:rnd(4,12)});}
    const over=new PIXI.Container();const hillY=(x:number)=>H*(.52+.09*(x/W)+.05*Math.sin(x/W*Math.PI*1.3+.4));
    const back=new PIXI.Graphics().beginFill(t.hillBack);back.moveTo(0,H);for(let x=0;x<=W;x+=8)back.lineTo(x,hillY(x)-H*.04+10*Math.sin(x*.01));back.lineTo(W,H).endFill();back.filters=[new PIXI.BlurFilter(3)];over.addChild(back);
    const hill=new PIXI.Graphics().beginFill(t.hill);hill.moveTo(0,H);for(let x=0;x<=W;x+=8)hill.lineTo(x,hillY(x));hill.lineTo(W,H).endFill();over.addChild(hill);
    // ponytail: 2500 strokes, not the reference's 5500 — half the build time on a fanless laptop and the dither hides the difference
    const grass=new PIXI.Graphics();for(let i=0;i<2500;i++){const x=rnd(0,W),top=hillY(x),y=rnd(top,H),len=rnd(4,12)*(.6+(y-top)/(H-top));grass.lineStyle(rnd(1,2.2),t.grass[i%5],rnd(.5,.9)).moveTo(x,y).lineTo(x+rnd(-3,3),y-len);}over.addChild(grass);
    const fl=new PIXI.Graphics();for(let i=0;i<260;i++){const x=rnd(0,W);fl.beginFill(t.dots,.8).drawCircle(x,rnd(hillY(x)+10,H),rnd(1,2.2)).endFill();}
    for(let i=0;i<600;i++){const x=rnd(W*.55,W),y=rnd(Math.max(hillY(x)+40,H*.72),H);fl.lineStyle(rnd(2,4),t.patch[i%2],rnd(.4,.8)).moveTo(x,y).lineTo(x+rnd(-2,2),y-rnd(6,18));}over.addChild(fl);
    world.addChild(bake(over,full));};
   build();let timer=0;const resize=()=>{clearTimeout(timer);timer=window.setTimeout(build,200);};window.addEventListener('resize',resize);
   app.ticker.add(dt=>{crt.uniforms.uTime+=dt/60;const W=app.screen.width;for(const c of clouds){c.g.x-=c.speed*dt/60;if(c.g.x<-480)c.g.x=W;}});
   const visibility=()=>document.hidden?app.ticker.stop():app.ticker.start();document.addEventListener('visibilitychange',visibility);
   el.dataset.ready='true';
   cleanup=()=>{clearTimeout(timer);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);app.destroy(true,{children:true,texture:true,baseTexture:true});};});
  return()=>{dead=true;cleanup();};},[season]);
 return <div ref={host} className="retro-wallpaper" data-season={season} aria-hidden="true"/>;}
