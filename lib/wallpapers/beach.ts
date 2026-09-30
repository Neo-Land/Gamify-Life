import type {Kit} from './kit';
import type {Graphics} from 'pixi.js';
/** Summer Beach: sea sparkle, animated surf, palm, umbrella, gulls. */
export function beach({still,live,PIXI,W,H,G,add,blur,grad,clouds,rnd,pick,anim,clock}:Kit){
 add(grad(W,H,[[0,'#2f7fd8'],[.4,'#6fc0f0'],[.62,'#d8f0f8']]));
 blur(add(G()),14).beginFill(0xfff6c8,.4).drawCircle(W*.8,H*.18,W*.09).endFill().beginFill(0xfffbe8).drawCircle(W*.8,H*.18,W*.035).endFill();
 clouds({n:7,cols:[0xffffff,0xf0faff,0xe0f0ff],y0:.06,y1:.36,a:[.4,.75]});
 const hz=H*.5,shore=H*.72;
 const isl=blur(add(G()),1.5).beginFill(0x5a8a9a);isl.moveTo(W*.42,hz);isl.bezierCurveTo(W*.48,hz-H*.05,W*.58,hz-H*.065,W*.66,hz);isl.endFill();
 add(grad(W,shore-hz+20,[[0,'#1d6fa0'],[.5,'#2a9ab8'],[1,'#5ad6d0']],0,hz));
 const glints=live(add(new PIXI.Container())),sp:(Graphics&{ph:number;sp:number})[]=[];for(let i=0;i<150;i++){const y=rnd(hz+3,shore-12),g=glints.addChild(Object.assign(G().beginFill(0xffffff).drawRect(0,0,rnd(4,14)*(y-hz)/(shore-hz)+2,1.5).endFill(),{ph:rnd(0,6.28),sp:rnd(1.5,4)}));
  g.position.set(rnd(0,W),y);sp.push(g);}
 anim.push(dt=>sp.forEach(s=>{s.alpha=Math.max(0,Math.sin(clock.T*s.sp+s.ph))*.8;s.x-=6*dt;if(s.x<-20)s.x=W+10;}));
 add(grad(W,H-shore+30,[[0,'#f4dca6'],[1,'#e2bc7a']],0,shore-10));
 const sd=add(G());for(let i=0;i<900;i++)sd.beginFill(pick([0xd8b070,0xfff0c8,0xc89a60]),rnd(.4,.8)).drawRect(rnd(0,W),rnd(shore+20,H),rnd(1,2),rnd(1,2)).endFill();
 for(let i=0;i<14;i++)sd.beginFill(pick([0xffe8e0,0xf0c8b0,0xffffff])).drawEllipse(rnd(0,W),rnd(shore+40,H),rnd(3,5),rnd(2,3)).endFill();
 still(sd);
 const wave=live(add(G())),wy=(x:number)=>shore-6+6*Math.sin(x*.018+clock.T*1.1)+3*Math.sin(x*.047-clock.T*.7)+9*Math.sin(clock.T*.6);
 const surf=()=>{wave.clear();
  wave.beginFill(0xdcbc80,.85).moveTo(0,shore+26);for(let x=0;x<=W;x+=8)wave.lineTo(x,wy(x)+12);wave.lineTo(W,shore+26).endFill();
  wave.beginFill(0x6fe0d8,.75).moveTo(0,shore-26);for(let x=0;x<=W;x+=8)wave.lineTo(x,wy(x));wave.lineTo(W,shore-26).endFill();
  wave.lineStyle(3,0xffffff,.9).moveTo(0,wy(0));for(let x=8;x<=W;x+=8)wave.lineTo(x,wy(x));
  wave.lineStyle(2,0xffffff,.45).moveTo(0,wy(0)-10);for(let x=8;x<=W;x+=8)wave.lineTo(x,wy(x)-10+3*Math.sin(x*.03+clock.T*2));};
 surf();anim.push(surf);   // drawn once up front so a still (reduced-motion) frame still has its surf line
 // umbrella + towel
 const ux=W*.3,uy=H*.79,uR=Math.min(W,H)*.1,um=add(G());
 um.beginFill(0xc89a60,.5).drawEllipse(ux+10,uy+18,uR*1.1,uR*.22).endFill();
 for(let i=0;i<4;i++)um.beginFill(i%2?0xffffff:0x2a8ad8).drawRect(ux-uR*1.3+i*14,uy+6,14,uR*.45).endFill();
 um.lineStyle(3,0x8a8a8a).moveTo(ux,uy+14).lineTo(ux-6,uy-uR*1.1).lineStyle(0);
 for(let i=0;i<6;i++){um.beginFill(i%2?0xffffff:0xe03a3a).moveTo(ux-6,uy-uR*1.1);
  um.arc(ux-6,uy-uR*1.1,uR,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6);um.lineTo(ux-6,uy-uR*1.1).endFill();}
 // palm tree
 const palm=add(G()),bx=W*.95,by=H*1.02,ph=H*.6;let cx=0,cy=0;
 for(let i=0;i<=44;i++){const t=i/44;cx=bx-Math.sin(t*1.5)*W*.07;cy=by-t*ph;
  palm.beginFill(i%4<2?0x7a5230:0x94683c).drawEllipse(cx,cy,10-t*4,8).endFill();}
 const greens=[0x2e8a3a,0x3fa848,0x247030];
 [-2.9,-2.4,-1.9,-1.35,-.8,-.3,.25,2.85].forEach((a,k)=>{const L=ph*rnd(.32,.42);
  for(let s=0;s<=1;s+=.04){const px=cx+Math.cos(a)*s*L,py=cy+Math.sin(a)*s*L+s*s*L*.55;
   palm.beginFill(greens[k%3]).drawEllipse(px,py,4,3).endFill();
   if(s>.1){const n=(1-s)*16+4;palm.lineStyle(2.5,greens[(k+1)%3]).moveTo(px,py).lineTo(px-Math.sin(a)*n,py+Math.cos(a)*n*.4+n*.6)
    .moveTo(px,py).lineTo(px+Math.sin(a)*n,py-Math.cos(a)*n*.4+n*.6).lineStyle(0);}}});
 for(let i=0;i<3;i++)palm.beginFill(0x5a3a1a).drawCircle(cx-6+i*6,cy+8,5).endFill();
 still(palm);
 // gulls
 const flock=live(add(new PIXI.Container())),gulls:(Graphics&{v:number;ph:number;by:number})[]=[];for(let i=0;i<6;i++){const g=G().lineStyle(2.5,0x3a3a3a).moveTo(-7,0).quadraticCurveTo(-3.5,-5,0,0).quadraticCurveTo(3.5,-5,7,0);
  g.scale.x=1.6;g.position.set(rnd(0,W),rnd(H*.12,H*.4));gulls.push(flock.addChild(Object.assign(g,{v:rnd(18,40),ph:rnd(0,6.28),by:g.y})));}
 anim.push(dt=>gulls.forEach(g=>{g.x+=g.v*dt;g.y=g.by+Math.sin(clock.T*.8+g.ph)*8;g.scale.y=.8+.8*Math.abs(Math.sin(clock.T*5+g.ph));if(g.x>W+20)g.x=-20;}));
}
