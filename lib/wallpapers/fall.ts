import type {Kit} from './kit';
import type {Graphics} from 'pixi.js';
/** Autumn Hills: golden-hour sky, tree line, falling leaves. */
export function fall({still,live,PIXI,W,H,G,add,blur,grad,clouds,ridge,strokes,rnd,pick,anim,clock}:Kit){
 const tc=[0xd9531e,0xe98a2a,0xf2c14a,0xb8321e,0x9a5a1a,0xe0702a];
 add(grad(W,H,[[0,'#3d5fa8'],[.35,'#8a8cc0'],[.6,'#eaa56e'],[.8,'#f7d49a']]));
 blur(add(G()),18).beginFill(0xffe0a0,.5).drawCircle(W*.72,H*.47,W*.09).endFill().beginFill(0xfff4d0,.95).drawCircle(W*.72,H*.47,W*.035).endFill();
 clouds({n:8,cols:[0xffd6b0,0xf6b08a,0xffe8cc,0xe89a8a],y0:.08,y1:.42,a:[.3,.6]});
 const far=(x:number)=>H*(.5+.03*Math.sin(x/W*6+1)+.02*Math.sin(x/W*13));
 ridge(far,0xb58a78,4);
 const mid=(x:number)=>H*(.58+.05*Math.sin(x/W*3.2+.6)+.04*(x/W));
 ridge(x=>mid(x)+8,0x9a4a1a);
 const trees=add(G());
 for(let i=0;i<280;i++){const x=rnd(-20,W+20),y=mid(x)+rnd(-4,10),r=rnd(10,24);
  trees.beginFill(0x3a2412).drawRect(x-1.5,y,3,r*.8).endFill();
  for(let j=0;j<5;j++)trees.beginFill(pick(tc),rnd(.75,1)).drawCircle(x+rnd(-r*.6,r*.6),y-r*.3+rnd(-r*.5,r*.4),r*rnd(.45,.7)).endFill();}
 still(trees);
 const near=(x:number)=>H*(.72+.06*(x/W)-.04*Math.sin(x/W*Math.PI*1.2+.3));
 ridge(near,0xb8742a);
 strokes(near,4500,[0xc98a3a,0xa8641e,0xe0a850,0x8a4a16,0xd8b060]);
 const lv=add(G());
 for(let i=0;i<600;i++){const x=rnd(0,W),y=rnd(near(x)+6,H);lv.beginFill(pick(tc),rnd(.6,.95)).drawEllipse(x,y,rnd(2,4),rnd(1,2)).endFill();}
 still(lv);
 // lone maple on the right
 const lx=W*.82,ly=near(W*.82)+4,th=H*.2,lone=add(G());
 lone.beginFill(0x3a2412).drawPolygon([lx-7,ly,lx+7,ly,lx+3,ly-th,lx-3,ly-th]).endFill();
 lone.lineStyle(3,0x3a2412).moveTo(lx,ly-th*.7).lineTo(lx-th*.25,ly-th*1.05).moveTo(lx,ly-th*.8).lineTo(lx+th*.3,ly-th*1.1);
 lone.lineStyle(0);
 for(let i=0;i<70;i++)lone.beginFill(pick(tc)).drawCircle(lx+rnd(-th*.5,th*.5),ly-th*1.15+rnd(-th*.28,th*.25),rnd(th*.07,th*.14)).endFill();
 // falling leaves
 const box=live(add(new PIXI.Container())),leaves:(Graphics&{v:number;sw:number;ph:number;spin:number})[]=[];
 for(let i=0;i<70;i++){const g=Object.assign(G().beginFill(pick(tc)).drawEllipse(0,0,rnd(3,6),rnd(1.5,3)).endFill(),{v:rnd(18,45),sw:rnd(.6,1.8),ph:rnd(0,6.28),spin:rnd(-2.5,2.5)});
  g.position.set(rnd(0,W),rnd(-H,H));box.addChild(g);leaves.push(g);}
 anim.push(dt=>leaves.forEach(l=>{l.y+=l.v*dt;l.x+=(Math.sin(clock.T*l.sw+l.ph)*22-10)*dt;l.rotation+=l.spin*dt;
  if(l.y>H+10){l.y=-10;l.x=rnd(0,W+120);}}));
}
