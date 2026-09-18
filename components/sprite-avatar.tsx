'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {avatarItems} from '@/lib/content';
import {BASE_FRAME,BODY_ORIGIN,BODY_PALETTE,SPRITE_CANVAS,anchorDelta,anchorFor,bodyIsAnimated,recolorPixels,resolveSpriteLayers,spriteFrames,spriteTags,type AnimationTag,type SpriteItem,type SpriteLayer} from '@/lib/sprites';
const SCALE=2;
const images=new Map<string,Promise<ImageBitmap>>();
const recolored=new Map<string,Promise<HTMLCanvasElement|ImageBitmap>>();
function loadImage(src:string){let p=images.get(src);if(!p){p=fetch(src).then(r=>r.blob()).then(b=>createImageBitmap(b));images.set(src,p);}return p;}
function loadLayer(src:string,item:SpriteItem|null,skin?:string,hair?:string){const palette=item?item.palette:BODY_PALETTE;const useSkin=palette?.skin?skin:undefined,useHair=palette?.hair?hair:undefined;const key=`${src}|${useSkin||''}|${useHair||''}`;let p=recolored.get(key);if(!p){p=loadImage(src).then(bmp=>{if(!palette||(!useSkin&&!useHair))return bmp;const c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;const ctx=c.getContext('2d')!;ctx.drawImage(bmp,0,0);const data=ctx.getImageData(0,0,c.width,c.height);recolorPixels(data.data,{palette,skin:useSkin,hair:useHair});ctx.putImageData(data,0,0);return c;});recolored.set(key,p);}return p;}
const framesOf=(layer:SpriteLayer)=>layer.frames??[layer.src];
type Drawn={item:SpriteItem|null;layer:SpriteLayer;art:(HTMLCanvasElement|ImageBitmap)[]};
export type SpriteCrop={x:number;y:number;width:number;height:number};
/** Canvas-composited sprite character. `crop` is in canvas pixels; `flip` mirrors for a left-facing view.
 * Frames advance on their own authored durations; modular layers ride the head/pelvis anchors. */
export function SpriteAvatar({selection,animation='idle',flip=false,crop,decorative=false,className=''}:{selection:Record<string,string>;animation?:AnimationTag;flip?:boolean;crop?:SpriteCrop;decorative?:boolean;className?:string}){
 const ref=useRef<HTMLCanvasElement>(null),drawn=useRef<Drawn[]>([]);
 const [frame,setFrame]=useState(BASE_FRAME),[ready,setReady]=useState(0),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(false);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>{setHidden(document.hidden);setReduced(query.matches||document.documentElement.dataset.motion==='reduced');};sync();document.addEventListener('visibilitychange',sync);query.addEventListener('change',sync);const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});return()=>{document.removeEventListener('visibilitychange',sync);query.removeEventListener('change',sync);observer.disconnect();};},[]);
 const skin=avatarItems.find(i=>i.id===selection.body)?.color,hairColor=avatarItems.find(i=>i.id===selection.hairColor)?.color;
 const key=JSON.stringify([selection,crop]);
 const draw=useCallback((at:number)=>{const canvas=ref.current;if(!canvas)return;const box=crop||{x:0,y:0,...SPRITE_CANVAS};const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);for(const {item,layer,art} of drawn.current){const img=art[art.length>1?at:0]??art[0];if(!img)continue;const move=item?anchorDelta(at,anchorFor(item)):{x:0,y:0};const ox=layer.full?0:BODY_ORIGIN.x+layer.x,oy=layer.full?0:BODY_ORIGIN.y+layer.y,k=(layer.scale??1)*SCALE;ctx.drawImage(img,(ox+move.x-box.x)*SCALE,(oy+move.y-box.y)*SCALE,img.width*k,img.height*k);}},[crop]);
 useEffect(()=>{let alive=true;const canvas=ref.current;if(!canvas)return;const box=crop||{x:0,y:0,...SPRITE_CANVAS};canvas.width=box.width*SCALE;canvas.height=box.height*SCALE;Promise.all(resolveSpriteLayers(selection).map(async l=>({...l,art:await Promise.all(framesOf(l.layer).map(s=>loadLayer(s,l.item,skin,hairColor)))}))).then(list=>{if(!alive)return;drawn.current=list;setReady(v=>v+1);}).catch(()=>{});return()=>{alive=false;};},[key,skin,hairColor,selection,crop]);
 useEffect(()=>{draw(frame);},[frame,ready,draw]);
 useEffect(()=>{if(!bodyIsAnimated()||hidden||reduced){setFrame(BASE_FRAME);return;}const {from,to}=spriteTags[animation];let at:number=from;setFrame(at);let timer=window.setTimeout(function step(){at=at>=to?from:at+1;setFrame(at);timer=window.setTimeout(step,spriteFrames[at].ms);},spriteFrames[at].ms);return()=>window.clearTimeout(timer);},[animation,hidden,reduced]);
 const description=['hair','top','bottoms','outerwear','headwear','faceAccessory','backItem','prop'].map(s=>avatarItems.find(i=>i.id===selection[s])?.name).filter(n=>n&&!n.toLowerCase().startsWith('no ')&&n!=='none').join(', ');
 return <span className={`sprite-avatar ${className}`} data-animation={animation} data-frames={bodyIsAnimated()||undefined} data-flip={flip||undefined} data-paused={hidden}><canvas ref={ref} role={decorative?'presentation':'img'} aria-hidden={decorative||undefined} aria-label={decorative?undefined:`Pixel character wearing ${description}`}/></span>;
}
