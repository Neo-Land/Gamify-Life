/** Shared drawing kit for the wallpaper scenes, ported from docs/design/retro-reference.html.
 * `pixi.js` arrives as an argument so nothing here pulls it into the server bundle.
 * Two changes from the reference, both for speed, neither visible: every blurred layer is baked to a
 * texture once after the scene is built (`bake`), and clouds are blurred one by one (the reference
 * blurs their shared parent, which re-blurs the whole sky every frame). Pixi 7's cacheAsBitmap drops
 * filtered objects, hence the explicit bake. */
import type * as PixiNS from 'pixi.js';
export type Pixi=typeof PixiNS;
export type Updater=(dt:number)=>void;
export type Kit=ReturnType<typeof kit>;
export function kit(PIXI:Pixi,layer:PixiNS.Container,W:number,H:number,name:string,renderer?:PixiNS.IRenderer){
 let _s=[...name].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7);   // same scene name -> same picture, every time
 const rand=()=>{_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const rnd=(a:number,b:number)=>a+rand()*(b-a),pick=<T,>(a:T[])=>a[rand()*a.length|0],G=()=>new PIXI.Graphics();
 const anim:Updater[]=[],clock={T:0},toBake:{o:PixiNS.DisplayObject;pad:number;swap?:(s:PixiNS.Sprite)=>void}[]=[],liveSet=new Set<PixiNS.DisplayObject>();
 /** Anything an updater moves, fades or redraws. Everything else in the layer is merged into textures by `bake`. */
 const live=<T extends PixiNS.DisplayObject>(o:T)=>{liveSet.add(o);return o;};
 const add=<T extends PixiNS.DisplayObject>(o:T)=>(layer.addChild(o),o);
 const blur=<T extends PixiNS.DisplayObject>(o:T,n:number,swap?:(s:PixiNS.Sprite)=>void)=>{o.filters=[new PIXI.BlurFilter(n,4)];toBake.push({o,pad:n*3,swap});return o;};
 /** Render each blurred object once and put a plain sprite in its place. Needs the renderer; without it the live filters stay. */
 /** Static, unfiltered layers are baked too: one sprite per layer instead of thousands of strokes a frame. */
 const still=<T extends PixiNS.DisplayObject>(o:T)=>{toBake.push({o,pad:2});return o;};
 /** Yields between textures so no single task blocks the page for long (the CSS gradient shows meanwhile). */
 async function bake(alive:()=>boolean=()=>true){if(!renderer)return;const yieldTask=()=>new Promise(r=>setTimeout(r,0));for(const {o,pad,swap} of toBake){await yieldTask();if(!alive())return;const parent=o.parent;if(!parent)continue;const i=parent.getChildIndex(o),x=o.x,y=o.y,alpha=o.alpha;
  parent.removeChild(o);o.position.set(0,0);const b=o.getLocalBounds(),region=new PIXI.Rectangle(b.x-pad,b.y-pad,b.width+pad*2,b.height+pad*2);
  const sprite=new PIXI.Sprite(renderer.generateTexture(o,{region,resolution:1}));sprite.position.set(x+region.x,y+region.y);sprite.alpha=alpha;parent.addChildAt(sprite,i);o.destroy({children:true});swap?.(sprite);}toBake.length=0;
  // then merge each run of static children between live ones into one full-screen texture
  const full=new PIXI.Rectangle(0,0,W,H),kids=[...layer.children];let run:PixiNS.DisplayObject[]=[];
  const flush=()=>{if(run.length>1){const i=layer.getChildIndex(run[0]),box=new PIXI.Container();run.forEach(o=>box.addChild(o));
   const sprite=new PIXI.Sprite(renderer!.generateTexture(box,{region:full,resolution:1}));layer.addChildAt(sprite,i);box.destroy({children:true,texture:true,baseTexture:true});}run=[];};
  await yieldTask();if(!alive())return;for(const o of kids){if(liveSet.has(o))flush();else run.push(o);}flush();}
 function grad(w:number,h:number,stops:[number,string][],x=0,y=0){ // vertical gradient sprite from a 1px canvas
  const c=document.createElement('canvas');c.width=1;c.height=256;const g=c.getContext('2d')!,gr=g.createLinearGradient(0,0,0,256);
  stops.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,1,256);
  const s=new PIXI.Sprite(PIXI.Texture.from(c));s.position.set(x,y);s.width=w;s.height=h;return s;}
 function clouds({n=9,cols=[0xffffff,0xffe4f2,0xd6f4ff,0xf6d0ec],y0=.05,y1=.5,a=[.35,.7],b=22,s=[.6,1.4]}:{n?:number;cols?:number[];y0?:number;y1?:number;a?:number[];b?:number;s?:number[]}={}){
  const air=live(add(new PIXI.Container())),list:{g:PixiNS.DisplayObject;speed:number}[]=[];
  for(let k=0;k<n;k++){const g=G(),sc=rnd(s[0],s[1]);
   for(let i=0;i<16;i++)g.beginFill(cols[i%cols.length],rnd(a[0],a[1])).drawCircle(rnd(-90,90)*sc,rnd(-25,25)*sc-i*1.5,rnd(22,48)*sc).endFill();
   g.position.set(rnd(0,W),rnd(H*y0,H*y1));air.addChild(g);const c={g:g as PixiNS.DisplayObject,speed:rnd(4,12)};blur(g,b,sp=>{c.g=sp;});list.push(c);}
  anim.push(dt=>list.forEach(c=>{c.g.x-=c.speed*dt;if(c.g.x<-220)c.g.x=W+220;}));
  return air;}
 function ridge(f:(x:number)=>number,color:number,b?:number){const g=G().beginFill(color);g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,f(x));g.lineTo(W,H).endFill();if(b)blur(g,b);else still(g);return add(g);}
 function strokes(top:(x:number)=>number,n:number,cols:number[],len=[4,12]){const g=G();
  for(let i=0;i<n;i++){const x=rnd(0,W),t=top(x),y=rnd(t,H),l=rnd(len[0],len[1])*(.6+(y-t)/(H-t));
   g.lineStyle(rnd(1,2.2),cols[i%cols.length],rnd(.5,.9)).moveTo(x,y).lineTo(x+rnd(-3,3),y-l);}
  still(g);return add(g);}
 return {PIXI,W,H,anim,clock,rand,rnd,pick,G,add,blur,still,live,bake,grad,clouds,ridge,strokes};
}
