import type {Kit} from './kit';
import type {Graphics} from 'pixi.js';
/** City Nights: synthwave sun, 3-layer skyline, blinking windows, traffic. */
export function city({still,live,PIXI,W,H,G,add,blur,grad,clouds,rnd,rand,pick,anim,clock}:Kit){
 add(grad(W,H,[[0,'#120c34'],[.35,'#3a2470'],[.58,'#a8487a'],[.72,'#f59a6a']]));
 const st=add(G());for(let i=0;i<220;i++)st.beginFill(0xffffff,rnd(.25,.9)).drawRect(rnd(0,W),rnd(0,H*.45),rnd(1,2.2),rnd(1,2.2)).endFill();
 const twinkle=live(add(new PIXI.Container())),tw:(Graphics&{ph:number;sp:number})[]=[];for(let i=0;i<25;i++){const g=twinkle.addChild(Object.assign(G().beginFill(0xfff6d0).drawRect(-1.5,-1.5,3,3).endFill(),{ph:rnd(0,6.28),sp:rnd(1,3)}));
  g.position.set(rnd(0,W),rnd(0,H*.4));tw.push(g);}
 anim.push(()=>tw.forEach(s=>s.alpha=.3+.7*Math.abs(Math.sin(clock.T*s.sp+s.ph))));
 // striped retro sun (2D canvas: gradient disc with slices cut out)
 const r=Math.round(Math.min(W,H)*.2),c=document.createElement('canvas');c.width=c.height=r*2;
 const x=c.getContext('2d')!,gr=x.createLinearGradient(0,0,0,r*2);gr.addColorStop(0,'#ffe27a');gr.addColorStop(.6,'#ff7a6a');gr.addColorStop(1,'#d8407a');
 x.fillStyle=gr;x.beginPath();x.arc(r,r,r,0,7);x.fill();x.globalCompositeOperation='destination-out';
 for(let i=0;i<7;i++)x.fillRect(0,r*1.02+i*r*.14,r*2,2+i*1.8);
 blur(add(G()),30).beginFill(0xff7a8a,.35).drawCircle(W*.6,H*.6,r*1.35).endFill();
 const sun=add(new PIXI.Sprite(PIXI.Texture.from(c)));sun.anchor.set(.5);sun.position.set(W*.6,H*.6);
 clouds({n:5,cols:[0x6a3a8a,0x8a4a9a,0xc0608a],y0:.2,y1:.5,a:[.25,.45],b:16,s:[1,1.8]});
 const base=H*.86,layers:{wins:{x:number;y:number;on:boolean;c:number}[];g:Graphics;draw:()=>void}[]=[];
 add(grad(W,H*.3,[[0,'rgba(245,154,106,0)'],[1,'rgba(245,154,106,.55)']],0,base-H*.3));
 function skyline(color:number,minH:number,maxH:number,wMin:number,wMax:number,lit:number,b?:number){
  const g=add(G()),wins:{x:number;y:number;on:boolean;c:number}[]=[];let x=-rnd(0,40);
  while(x<W){const w=rnd(wMin,wMax),h=rnd(minH,maxH)*H,top=base-h;
   g.beginFill(color).drawRect(x,top,w,h+2).endFill();
   if(rand()<.25)g.beginFill(color).drawRect(x+w*.4,top-h*.1,2,h*.1).endFill();
   if(rand()<.2)g.beginFill(color).drawRect(x+w*.2,top-10,w*.6,10).endFill();
   if(lit)for(let wy=top+8;wy<base-8;wy+=9)for(let wx=x+5;wx<x+w-6;wx+=8)
    wins.push({x:wx,y:wy,on:rand()<lit,c:pick([0xffe08a,0xffd060,0xfff2c0,0x8ad8ff])});
   x+=w+rnd(0,6);}
  if(b)blur(g,b);else still(g);
  const L={wins,g:live(add(G())),draw:()=>{L.g.clear();wins.forEach(w=>w.on&&L.g.beginFill(w.c,.9).drawRect(w.x,w.y,4,5).endFill());}};
  L.draw();layers.push(L);
 }
 skyline(0x5a3a7a,.2,.36,40,90,0,2);
 skyline(0x2e2050,.12,.3,30,70,.18);
 skyline(0x120c20,.08,.22,40,100,.28);
 let acc=0;anim.push(dt=>{if((acc+=dt)<.5)return;acc=0;
  layers.forEach(L=>{if(!L.wins.length)return;L.wins.forEach(w=>{if(Math.random()<.015)w.on=!w.on;});L.draw();});});
 const road=add(G()).beginFill(0x0c0a14).drawRect(0,base,W,H-base).endFill().beginFill(0x3a3050).drawRect(0,base,W,3).endFill();
 for(let x=0;x<W;x+=40)road.beginFill(0xd8c060,.6).drawRect(x,base+(H-base)*.55,20,2).endFill();
 const lg=blur(add(G()),10),lamps=add(G());
 for(let x=30;x<W;x+=160){lg.beginFill(0xffd070,.3).drawCircle(x+2,base-40,24).endFill();
  lamps.beginFill(0x2a2438).drawRect(x,base-40,3,40).endFill().beginFill(0xffe8a0).drawCircle(x+2,base-42,3).endFill();}
 const cars=live(add(G())),cl:{x:number;d:number;v:number}[]=[];for(let i=0;i<9;i++)cl.push({x:rnd(0,W),d:i%2?1:-1,v:rnd(60,140)});
 anim.push(dt=>{cars.clear();cl.forEach(c=>{c.x+=c.d*c.v*dt;if(c.x>W+60)c.x=-60;if(c.x<-60)c.x=W+60;
  const y=base+(H-base)*(c.d>0?.75:.32),f=c.x+c.d*15,b=c.x-c.d*15;
  cars.beginFill(0x1e1a2a).drawRect(c.x-14,y-4,28,7).endFill();
  cars.beginFill(0xfff4c0).drawRect(f-2,y-2,4,2).endFill().beginFill(0xfff4c0,.15).drawRect(c.d>0?f:f-44,y-4,44,6).endFill();
  cars.beginFill(0xff3040).drawRect(b-2,y-2,3,2).endFill();});});
}
