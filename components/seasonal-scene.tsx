'use client';
import {useEffect,useId,useMemo,useState,type CSSProperties} from 'react';
import type {Rect,SceneAnchor} from '@/lib/home-scene';
import {seasonalThemes,type ThemeChoice,type SeasonalThemeId} from '@/lib/themes';
/** Original pixel geometry is redrawn on a two-pixel grid; no scaled landscape bitmap.
 * Detail is cheap because every shape of one colour is concatenated into a single path:
 * a skyline of forty lit windows costs one DOM node, not forty. */
type Box=[number,number,number,number];
const q=(n:number)=>Math.round(n/2)*2;
const rects=(boxes:Box[])=>boxes.map(([x,y,w,h])=>`M${q(x)} ${q(y)}h${q(w)}v${q(h)}h${-q(w)}z`).join('');
/** Deterministic, so the same viewport always draws the same scene and screenshots stay stable. */
const seeded=(seed:number)=>{let s=(seed*2654435761)>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};};
/** A filled ellipse rendered as stacked bands, which is what gives canopies and clouds their pixel edge. */
function disc(cx:number,cy:number,rx:number,ry:number,band=4):Box[]{const out:Box[]=[];for(let dy=-ry;dy<ry;dy+=band){const t=(dy+band/2)/ry,w=Math.round(rx*Math.sqrt(Math.max(0,1-t*t)));if(w>=1)out.push([cx-w,cy+dy,w*2,band]);}return out;}

type Palette={sky:[string,string,string];haze:string;sun:string;cloud:string;cloudShade:string;far:string;far2:string;farDetail:string;ground:string;groundShade:string;grass:string;grassLight:string;path:string;pathEdge:string;pathStone:string;trunk:string;trunkShade:string;canopy:[string,string,string];bloom:string;rock:string;rockShade:string;particle:[string,string,string]};
const palettes:Record<SeasonalThemeId,Palette>={
 fall:{sky:['#f2cba4','#edbb91','#e6ab80'],haze:'#dd9e74',sun:'#f7e1ad',cloud:'#f6ddbe',cloudShade:'#e0bb96',far:'#a4855f',far2:'#8b6d4f',farDetail:'#7a5c42',ground:'#a89d5f',groundShade:'#8d8149',grass:'#8a7f40',grassLight:'#c2b475',path:'#c69a6b',pathEdge:'#ab7f56',pathStone:'#d8b48b',trunk:'#6d4b33',trunkShade:'#513725',canopy:['#c4632c','#df9739','#f0bd63'],bloom:'#b8442c',rock:'#8f8578',rockShade:'#736a5f',particle:['#d4762f','#e5a94a','#b8502a']},
 spring:{sky:['#cfe0d4','#c2d7cb','#b6cdc2'],haze:'#aec4bb',sun:'#f6efc6',cloud:'#f2f0e2',cloudShade:'#d7d9c9',far:'#8fa98c',far2:'#7a9679',farDetail:'#6a8569',ground:'#a9bb8f',groundShade:'#93a87a',grass:'#84a067',grassLight:'#b3c88f',path:'#c9c49f',pathEdge:'#aca583',pathStone:'#ded9b6',trunk:'#6f5540',trunkShade:'#54402f',canopy:['#6f9a56','#8bb467','#a9cb82'],bloom:'#eec3d2',rock:'#8d8d80',rockShade:'#727266',particle:['#f0cbd8','#e8a8bd','#f7e6c0']},
 summer:{sky:['#a9d3da','#96c6d0','#84b8c6'],haze:'#7fadbb',sun:'#fbeeb2',cloud:'#f4f1dd',cloudShade:'#d8dcc9',far:'#7f9ea6',far2:'#5f93a2',farDetail:'#cfe6e4',ground:'#e3d1a2',groundShade:'#cdb888',grass:'#a9b17a',grassLight:'#f0e3bb',path:'#efdfb4',pathEdge:'#cfbb8c',pathStone:'#fbf2d4',trunk:'#7a5e3f',trunkShade:'#5c452d',canopy:['#4f7f52','#679a5c','#82ae68'],bloom:'#e7c96f',rock:'#8b8c82',rockShade:'#6f7068',particle:['#e8f2e6','#cfe7e0','#f6ecc2']},
 winter:{sky:['#b9c2d6','#a9b4cc','#99a6c1'],haze:'#8d9bb8',sun:'#e8ecf6',cloud:'#e2e6ef',cloudShade:'#c7cddc',far:'#7d8a9c',far2:'#6a7689',farDetail:'#5b6579',ground:'#c5d1d4',groundShade:'#adbcc1',grass:'#9fb0b4',grassLight:'#dde7e8',path:'#dee5e6',pathEdge:'#bcc8ca',pathStone:'#f1f4f4',trunk:'#5c4c44',trunkShade:'#453831',canopy:['#6b7a72','#7d8c81','#e9eef2'],bloom:'#f2f6f8',rock:'#939aa0',rockShade:'#767d83',particle:['#f3f6f8','#e4ebef','#ffffff']}
};

/** One tree. Trees keep their own group so a near tree still paints over a far one;
 * everything else in the scene is merged by colour, where depth order does not matter. */
function tree(x:number,baseY:number,scale:number,season:SeasonalThemeId,rand:()=>number){
 const h=Math.round(96*scale),trunkW=Math.max(4,Math.round(11*scale)),crown=baseY-h;
 const trunk:Box[]=[],shade:Box[]=[];
 // A tapered trunk: three stacked blocks, widest at the root.
 for(let i=0;i<4;i++){const w=trunkW-i*Math.max(1,trunkW/6),ty=baseY-h*.72*(i+1)/4-h*.02;
  trunk.push([x-w/2,ty,w,h*.72/4+2]);shade.push([x-w/2,ty,Math.max(2,w/3),h*.72/4+2]);}
 trunk.push([x-trunkW,baseY-4,trunkW*2,5]);
 const bare=season==='winter',palm=season==='summer';
 if(!palm)for(let i=0;i<4;i++){const dir=i%2?1:-1,by=crown+h*(.30+i*.13),len=Math.round((18-i*3)*scale),bw=Math.max(3,Math.round((5-i*.6)*scale));
  trunk.push([dir>0?x:x-len,by,len,bw]);
  if(bare)trunk.push([dir>0?x+len-bw:x-len,by-Math.round(11*scale),bw,Math.round(12*scale)]);}
 const canopy:[Box[],Box[],Box[]]=[[],[],[]];const extra:Box[]=[];
 if(palm){trunk.length=0;shade.length=0;const lean=rand()>.5?1:-1,H=Math.round(104*scale),w=Math.max(3,Math.round(7*scale));
  for(let i=0;i<11;i++){const t=i/11,tx=x+lean*t*t*18*scale;trunk.push([tx-w/2,baseY-H*t-H/11,w,H/11+2]);shade.push([tx-w/2,baseY-H*t-H/11,Math.max(2,w/3),H/11+2]);}
  const hx=x+lean*18*scale,hy=baseY-H;
  for(let f=0;f<7;f++){const a=(198+f*24)*Math.PI/180;
   for(let k=1;k<=7;k++){const d=k*5*scale,tone=k>5?canopy[2]:k>2?canopy[1]:canopy[0];
    tone.push([hx+Math.cos(a)*d,hy+Math.sin(a)*d*.62+k*k*.16*scale,Math.max(3,Math.round((8-k*.7)*scale)),Math.max(3,Math.round(5*scale))]);}}
  for(let i=0;i<3;i++)extra.push([hx-6*scale+i*5*scale,hy+3*scale,Math.max(2,Math.round(4*scale)),Math.max(2,Math.round(4*scale))]);
  return {trunk,shade,canopy,extra};}
 if(bare){for(let i=0;i<9;i++)canopy[2].push([x-Math.round(20*scale)+Math.round(rand()*40*scale),crown+Math.round(rand()*26*scale),Math.round(6*scale),Math.round(3*scale)]);}
 else{const rx=Math.round(25*scale),ry=Math.round(27*scale),cy=crown+ry*.8,band=Math.max(2,Math.round(3*scale));
  // An irregular silhouette: five overlapping lobes rather than one clean ellipse.
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2+rand()*.5,d=rx*(.18+rand()*.3);
   canopy[0].push(...disc(x+Math.cos(a)*d,cy+Math.sin(a)*d*.72,Math.round(rx*(.52+rand()*.26)),Math.round(ry*(.52+rand()*.26)),band));}
  canopy[0].push(...disc(x,cy,Math.round(rx*.8),Math.round(ry*.82),band));
  for(let i=0;i<6;i++){const a=rand()*Math.PI*2,d=rand()*rx*.5;canopy[1].push(...disc(x+Math.cos(a)*d,cy+Math.sin(a)*d*.7,Math.round(rx*.34),Math.round(ry*.32),band));}
  for(let i=0;i<5;i++){const a=-Math.PI*.2-rand()*Math.PI*.6,d=rx*.36+rand()*rx*.3;canopy[2].push(...disc(x+Math.cos(a)*d,cy+Math.sin(a)*d*.7,Math.round(rx*.24),Math.round(ry*.24),band));}
  const speck=season==='spring'?18:season==='fall'?14:8;
  for(let i=0;i<speck;i++){const a=rand()*Math.PI*2,d=rand()*rx*.9;extra.push([x+Math.cos(a)*d,cy+Math.sin(a)*d*.72,Math.max(2,Math.round(2*scale)),Math.max(2,Math.round(2*scale))]);}}
 return {trunk,shade,canopy,extra};
}

export function SeasonalScene({width,height,anchor,safeZones,choice,paused=false}:{width:number;height:number;anchor:SceneAnchor;safeZones:Rect[];choice:ThemeChoice;paused?:boolean}){
 const mask=useId().replaceAll(':','');const [hidden,setHidden]=useState(false);useEffect(()=>{const update=()=>setHidden(document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 const theme=seasonalThemes.find(t=>t.id===choice.themeId)!;const season=theme.id;const p=palettes[season];
 const x=q(width*anchor.x),horizon=q(height*.35),half=q(Math.min(width*.22,180)),narrow=width<640;
 const count=choice.animationIntensity==='off'?0:theme.animationLayers[choice.animationIntensity];

 const art=useMemo(()=>{
  const rand=seeded(width*31+height*7+season.length);
  const depthY=(t:number)=>q(horizon+(height-horizon)*t);
  const water=season==='summer'?depthY(.3):horizon;
  // Sky: bands toward the horizon, a sun, clouds and a few birds.
  const bands:Box[][]=[[],[],[]];
  for(let i=0;i<9;i++)bands[Math.min(2,Math.floor(i/3))].push([0,horizon-(9-i)*(horizon/9),width,horizon/9+2]);
  const sunX=q(width*.78),sunY=q(horizon*.34),sun=disc(sunX,sunY,24,24,4);
  const halo=season==='summer'?[[sunX-34,sunY-2,8,4],[sunX+26,sunY-2,8,4],[sunX-2,sunY-34,4,8],[sunX-2,sunY+26,4,8],[sunX-28,sunY-26,6,6],[sunX+22,sunY+20,6,6]] as Box[]:[];
  const cloud:Box[]=[],cloudShade:Box[]=[];
  for(let i=0;i<(narrow?3:6);i++){const cx=q(rand()*width),cy=q(10+rand()*horizon*.55),sc=.6+rand()*.9;
   const body=[...disc(cx,cy,26*sc,9*sc,3),...disc(cx-16*sc,cy+3*sc,16*sc,7*sc,3),...disc(cx+18*sc,cy+2*sc,18*sc,8*sc,3),...disc(cx+2*sc,cy-6*sc,15*sc,8*sc,3)];
   cloud.push(...body);cloudShade.push(...body.filter(b=>b[1]>cy+2).map(b=>[b[0],b[1]+b[3]-2,b[2],2] as Box));}
  const birds:Box[]=[];if(season!=='winter')for(let i=0;i<5;i++){const bx=q(width*.08+rand()*width*.6),by=q(horizon*.2+rand()*horizon*.4);birds.push([bx,by,3,2],[bx+3,by-2,3,2],[bx+6,by,3,2]);}

  // Distant band: a different horizon per season, the city being the densest.
  const far:Box[]=[],far2:Box[]=[],farDetail:Box[]=[],lit:Box[]=[],snowCap:Box[]=[];
  const farTrees:ReturnType<typeof tree>[]=[];
  if(season==='winter'){
   let bx=-20;while(bx<width+20){const bw=q(22+rand()*46),bh=q(46+rand()*130),top=horizon-bh;
    far.push([bx,top,bw,bh]);snowCap.push([bx-1,top-4,bw+2,5]);
    if(rand()>.55)far.push([bx+bw/2-2,top-18,4,18]);
    if(rand()>.72){far.push([bx+bw*.24,top-14,bw*.5,14]);snowCap.push([bx+bw*.24,top-18,bw*.5,4]);}
    if(rand()>.8)far.push([bx+bw*.3,top-26,bw*.16,12],[bx+bw*.24,top-30,bw*.3,5]);
    for(let wy=top+8;wy<horizon-8;wy+=12)for(let wx=bx+5;wx<bx+bw-7;wx+=11)(rand()>.45?lit:farDetail).push([wx,wy,5,7]);
    bx+=bw+q(3+rand()*8);}
  }else if(season==='summer'){
   for(const [top,amp,arr] of [[0,1,far],[1,.6,far2]] as [number,number,Box[]][]){
    let mx=-40;while(mx<width+40){const mw=q(110+rand()*150),peak=q((80+rand()*80)*amp);
     for(let i=0;i<mw;i+=4){const t=Math.abs(i-mw/2)/(mw/2);arr.push([mx+i,horizon-peak*(1-t*t*t)-top*10,4,peak+30]);}
     if(!top&&peak>92)for(let i=mw*.36;i<mw*.64;i+=4){const t=Math.abs(i-mw/2)/(mw/2);snowCap.push([mx+i,horizon-peak*(1-t*t*t),4,12]);}
     mx+=top?mw*.66:mw;}}
   // The lake edge: foam rows that get wider and further apart as they come forward.
   for(let wy=horizon+4,k=0;wy<water;wy+=q(5+k*2),k++)for(let i=q(rand()*40);i<width;i+=q(14+rand()*44))farDetail.push([i,wy,q(6+k*3+rand()*14),2]);
   for(let i=0;i<width;i+=4){const wv=q(water+Math.sin(i/width*Math.PI*9)*6);farDetail.push([i,wv-4,4,6]);if(rand()>.6)farDetail.push([i,wv+2,4,3]);}
   for(let i=0;i<width;i+=q(30+rand()*50))lit.push([i,water-q(3+rand()*4),q(14+rand()*26),3]);
   const bx=q(width*.62);far2.push([bx,horizon-20,3,20],[bx,horizon-18,14,12]);farDetail.push([bx-8,horizon-2,20,3]);
  }else{
   // Two rolling ridges, then a treeline that stands on the nearer one.
   for(const [amp,off,phase,arr] of [[42,10,0,far],[26,30,1.7,far2]] as [number,number,number,Box[]][]){
    for(let i=0;i<width+8;i+=4)arr.push([i,horizon-off-amp*(.45+.55*Math.sin(i/width*Math.PI*4.4+phase)),4,amp+off+14]);}
   let tx=q(rand()*40);while(tx<width+20){const sc=.18+rand()*.16,ty=q(horizon-26+Math.sin(tx/width*Math.PI*4.4+1.7)*14);
    farTrees.push(tree(tx,ty,sc,season,rand));tx+=q(16+rand()*34);}
   if(season==='spring'){const fx=q(width*.13);far2.push([fx,horizon-40,36,32],[fx+13,horizon-54,10,14]);farDetail.push([fx+5,horizon-30,9,11],[fx+23,horizon-30,9,11],[fx-4,horizon-44,44,6]);}
  }

  // Midground: the grove, drawn far to near so the depth ordering survives.
  const trees:{t:ReturnType<typeof tree>;s:number}[]=[];const mid:Box[]=[],midDetail:Box[]=[];
  const corridor=(tx:number,ty:number)=>Math.abs(tx-x)>q(20+half*((ty-horizon)/Math.max(1,height-horizon)))+40;
  const slots=narrow?[.1,.42,.74]:[.06,.26,.5,.76,.96];
  for(const d of slots)for(const sign of [-1,1]){
   const ty=depthY(Math.max(d,season==='summer'?.34:.1)),sc=.45+d*1.5;
   const tx=q(x+sign*(width*(.13+d*.3)+rand()*width*.04));
   if(tx<-40||tx>width+40||!corridor(tx,ty))continue;
   if(season==='winter'&&d<.4){const lh=q(56*sc);mid.push([tx-2,ty-lh+8,4,lh-8],[tx-7,ty-2,14,4]);midDetail.push([tx-6,ty-lh-9,12,10],[tx-4,ty-lh-12,8,4]);lit.push([tx-4,ty-lh-7,8,7]);continue;}
   trees.push({t:tree(tx,ty,sc,season,rand),s:sc});}
  if(season==='summer'){const ux=q(x-half*.62-width*.19),uy=depthY(.66);
   mid.push([ux-4,uy-112,8,116]);midDetail.push(...disc(ux,uy-114,80,31,4));
   for(let i=-72;i<72;i+=24)mid.push([ux+i,uy-120,6,36]);
   midDetail.push([ux+52,uy-12,96,26],[ux+62,uy-28,74,16]);}

  // Ground: banded from hazy at the horizon to darker underfoot, with a dither seam.
  const bandsGround:Box[]=[],dither:Box[]=[],grass:Box[]=[],grassLight:Box[]=[],scatter:Box[]=[],scatter2:Box[]=[],stones:Box[]=[];
  for(let i=1;i<4;i++){const gy=depthY(i/4);bandsGround.push([0,gy,width,height-gy]);
   for(let k=-4;k<5;k++)for(let gx=q(rand()*8);gx<width;gx+=4)if(rand()>.45+Math.abs(k)*.1)dither.push([gx,gy+k*2,2,2]);}
  const density=narrow?90:230;
  for(let i=0;i<density;i++){const t=rand()**1.4,gy=depthY(Math.max(t,season==='summer'?.32:.02)),gx=q(rand()*width),sc=1+((gy-horizon)/(height-horizon))*2.8;
   (rand()>.5?grass:grassLight).push([gx,gy,q(3*sc),q(2*sc)],[gx+q(2*sc),gy-q(2*sc),q(2*sc),q(3*sc)],[gx-q(2*sc),gy-q(1*sc),q(2*sc),q(2*sc)]);}
  for(let i=0;i<(narrow?34:80);i++){const t=rand()**1.2,sy=depthY(Math.max(t,season==='summer'?.34:.04)),sx=q(rand()*width),sc=1+((sy-horizon)/(height-horizon))*2.4;
   if(Math.abs(sx-x)<q(12+half*((sy-horizon)/Math.max(1,height-horizon))))continue;
   if(season==='fall')scatter.push([sx,sy,q(5*sc),q(3*sc)],[sx+q(4*sc),sy-q(2*sc),q(3*sc),q(3*sc)],[sx-q(3*sc),sy+q(2*sc),q(3*sc),q(2*sc)]);
   else if(season==='spring')(rand()>.5?scatter:scatter2).push([sx,sy-q(4*sc),q(3*sc),q(3*sc)],[sx-q(2*sc),sy-q(2*sc),q(3*sc),q(2*sc)],[sx+q(2*sc),sy-q(2*sc),q(3*sc),q(2*sc)],[sx,sy,q(2*sc),q(4*sc)]);
   else if(season==='winter')scatter.push(...disc(sx,sy,q(8*sc),q(3*sc),3));
   else scatter2.push([sx,sy,q(5*sc),q(2*sc)],[sx+q(4*sc),sy-q(2*sc),q(3*sc),q(3*sc)]);}
  for(let i=0;i<(narrow?34:86);i++){const t=rand()**1.6,sy=depthY(t),spread=q(10+half*((sy-horizon)/Math.max(1,height-horizon))),sc=.6+t*2;
   stones.push([q(x-spread+rand()*spread*2),sy,q(3*sc+rand()*5),q(2*sc)]);}

  // Foreground: big shapes at the outer edges, kept above the bottom chrome.
  const rock:Box[]=[],rockShade:Box[]=[],bush:Box[]=[],bushLight:Box[]=[];
  for(const sign of [-1,1])for(let i=0;i<2;i++){
   const bx=q(sign<0?width*(.05+i*.1):width*(.95-i*.1)),by=depthY(.72+i*.16),sc=1.5-i*.4;
   if(Math.abs(bx-x)<half+50)continue;
   if(i===0){bush.push(...disc(bx,by,q(34*sc),q(17*sc),4),...disc(bx-q(20*sc),by+q(5*sc),q(18*sc),q(11*sc),4),...disc(bx+q(22*sc),by+q(4*sc),q(17*sc),q(11*sc),4));
    for(let k=0;k<14;k++)bushLight.push([bx-q(30*sc)+rand()*q(60*sc),by-q(13*sc)+rand()*q(20*sc),4,3]);}
   else{rock.push(...disc(bx,by,q(24*sc),q(12*sc),4));rockShade.push(...disc(bx-q(6*sc),by-q(4*sc),q(12*sc),q(6*sc),4));}}

  return {bands,sun,halo,cloud,cloudShade,birds,far,far2,farDetail,lit,snowCap,farTrees,trees,mid,midDetail,bandsGround,dither,grass,grassLight,scatter,scatter2,stones,rock,rockShade,bush,bushLight,water};
 },[width,height,horizon,half,x,season,narrow]);

 function boundary(sign:number){return Array.from({length:12},(_,i)=>{const t=i/11,y=q(horizon+(height-horizon)*t),extent=q(12+half*t);return `${i?'L':'M'}${x+sign*extent} ${y}${i<11?`V${q(horizon+(height-horizon)*(i+1)/11)}`:''}`;}).join('');}
 const particle=(i:number)=>{const px=q((i*179+38)%width),py=q((i*89+53)%height);
  if(season==='spring')return <><path d={rects([[px,py,5,3],[px+5,py+1,3,2]])} fill="#e7c777"/><path d={rects([[px+1,py,2,3],[px+4,py,2,3]])} fill="#4b4b3c"/><path d={rects([[px+1,py-3,4,2],[px+4,py-2,3,2]])} fill="#f3f0dc" opacity=".8"/></>;
  if(season==='winter')return <path d={rects([[px+2,py,3,3],[px,py+2,7,3],[px+2,py+4,3,3]])} fill={p.particle[i%3]}/>;
  if(season==='summer')return <path d={rects([[px,py+2,10,2],[px+3,py,4,2],[px+3,py+4,4,2]])} fill={p.particle[i%3]} opacity=".7"/>;
  return <path d={rects([[px+2,py,6,3],[px,py+3,10,4],[px+2,py+7,6,3],[px+4,py+10,3,2]])} fill={p.particle[i%3]}/>;};
 const grove=(list:{t:ReturnType<typeof tree>;s:number}[])=>list.map((n,i)=><g key={i}><path d={rects(n.t.trunk)} fill={p.trunk}/><path d={rects(n.t.shade)} fill={p.trunkShade}/><path d={rects(n.t.canopy[0])} fill={p.canopy[0]}/><path d={rects(n.t.canopy[1])} fill={p.canopy[1]}/><path d={rects(n.t.canopy[2])} fill={p.canopy[2]}/><path d={rects(n.t.extra)} fill={p.bloom}/></g>);

 return <svg className="anchored-seasonal-scene" data-season={season} data-composition={narrow?'portrait':'landscape'} data-anchor-x={x} data-paused={paused||hidden} data-intensity={choice.animationIntensity} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges" aria-hidden="true">
 <defs><mask id={mask}><rect width={width} height={height} fill="white"/>{safeZones.map((r,i)=><rect key={i} x={r.x-12} y={r.y-12} width={r.width+24} height={r.height+24} fill="black"/>)}</mask></defs>
 <g data-scene-layer="sky"><rect width={width} height={height} fill={p.sky[0]}/><path d={rects(art.bands[1])} fill={p.sky[1]}/><path d={rects(art.bands[2])} fill={p.sky[2]}/><path d={rects([[0,horizon-10,width,12]])} fill={p.haze}/></g>
 <g data-scene-layer="celestial"><path d={rects(art.sun)} fill={p.sun} opacity=".9"/>{!!art.halo.length&&<path d={rects(art.halo)} fill={p.sun} opacity=".6"/>}<path d={rects(art.cloud)} fill={p.cloud} opacity=".92"/><path d={rects(art.cloudShade)} fill={p.cloudShade} opacity=".7"/><path d={rects(art.birds)} fill={p.farDetail} opacity=".5"/></g>
 <g data-scene-layer="distant"><path d={rects(art.far)} fill={p.far}/><path d={rects(art.far2)} fill={p.far2}/>{grove(art.farTrees.map(t=>({t,s:1})))}<path d={rects(art.snowCap)} fill={season==='summer'?'#eef3f4':'#e9eef2'}/></g>
 <g data-scene-layer="ground">
  <rect y={season==='summer'?art.water:horizon} width={width} height={height-(season==='summer'?art.water:horizon)} fill={p.ground}/>
  {season==='summer'&&<rect y={horizon} width={width} height={art.water-horizon} fill={p.far2}/>}
  <path d={rects(art.bandsGround)} fill={p.groundShade} opacity=".26"/><path d={rects(art.dither)} fill={p.groundShade} opacity=".3"/>
  <path d={rects(art.farDetail)} fill={season==='winter'?p.farDetail:season==='summer'?p.pathStone:p.farDetail} opacity={season==='summer'?.55:1}/>
  <path d={rects(art.lit)} fill={season==='winter'?'#f6e3a8':p.grassLight} opacity={season==='winter'?.95:.6}/>
  <path data-scene-layer="perspective" data-vanishing-x={x} d={`${boundary(-1)}L${x+half} ${height}${Array.from({length:12},(_,i)=>{const t=(11-i)/11;return `L${x+q(12+half*t)} ${q(horizon+(height-horizon)*t)}`;}).join('')}Z`} fill={p.path}/>
  <path d={boundary(-1)} fill="none" stroke={p.pathEdge} strokeWidth="3"/><path d={boundary(1)} fill="none" stroke={p.pathStone} strokeWidth="3"/><path d={rects(art.stones)} fill={p.pathStone} opacity=".75"/></g>
 <g data-scene-layer="midground">{grove(art.trees)}<path d={rects(art.midDetail)} fill={season==='winter'?p.farDetail:season==='summer'?'#d97c6a':p.canopy[0]}/><path d={rects(art.mid)} fill={season==='winter'?p.far2:p.trunk}/></g>
 <g data-scene-layer="scatter" mask={`url(#${mask})`}><path d={rects(art.grass)} fill={p.grass}/><path d={rects(art.grassLight)} fill={p.grassLight} opacity=".75"/><path d={rects(art.scatter)} fill={season==='fall'?p.canopy[0]:season==='winter'?p.grassLight:p.bloom}/><path d={rects(art.scatter2)} fill={season==='fall'?p.canopy[2]:season==='spring'?p.sun:p.grassLight}/></g>
 <g data-scene-layer="foreground" mask={`url(#${mask})`}><path d={rects(art.bush)} fill={season==='winter'?p.grassLight:season==='summer'?p.grass:p.canopy[0]}/><path d={rects(art.bushLight)} fill={season==='winter'?p.bloom:p.canopy[2]} opacity=".8"/><path d={rects(art.rock)} fill={p.rock}/><path d={rects(art.rockShade)} fill={p.rockShade}/></g>
 <g data-scene-layer="ambient" mask={`url(#${mask})`}>{Array.from({length:count},(_,i)=><g key={i} className="scene-particle" style={{'--drift':`${season==='summer'?8:24+i%3*12}px`,'--fall':`${season==='summer'?0:50+i%5*12}px`,'--duration':`${12+i%5*3}s`,'--delay':`${-i*3.7}s`} as CSSProperties}>{particle(i)}</g>)}</g></svg>;
}
