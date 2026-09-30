import type {Kit} from './kit';
/** Spring Meadow (the original). */
export function meadow({still,W,H,G,add,blur,grad,clouds,ridge,strokes,rnd}:Kit){
 add(grad(W,H,[[0,'#2f68cc'],[.45,'#5d9be6'],[.8,'#b9dcf6']]));
 const neb=G(),cu=G();
 ([[.33,.32,.16,0xbff6ff,.55],[.42,.44,.12,0xffc4e6,.5],[.36,.52,.1,0xffffff,.6],[.5,.3,.08,0x9ae8ff,.4]] as const)
  .forEach(([x,y,r,c,a])=>neb.beginFill(c,a).drawCircle(x*W,y*H,r*W).endFill());
 for(let i=0;i<40;i++){const a=i/40*Math.PI*4,rr=W*.02+i*W*.004;
  neb.beginFill(i%2?0xffffff:0xd8f8ff,.18).drawCircle(W*.38+Math.cos(a)*rr,H*.42+Math.sin(a)*rr*.6,W*.02).endFill();}
 for(let i=0;i<60;i++)cu.beginFill(i%3?0xe8ecff:0xc4c8ee,.55).drawCircle(W*rnd(.55,.95),H*rnd(.3,.58)-i*1.2,W*rnd(.02,.05)).endFill();
 // the reference puts these inside the cloud layer's blur; they sit just behind it instead, so they merge into the static sky
 add(blur(cu,22));add(blur(neb,22));clouds();
 const hillY=(x:number)=>H*(.52+.09*(x/W)+.05*Math.sin(x/W*Math.PI*1.3+.4));
 ridge(x=>hillY(x)-H*.04+10*Math.sin(x*.01),0x8fb86a,3);
 ridge(hillY,0x5e9a3c);
 strokes(hillY,5500,[0x4c8a2e,0x6fae45,0x86c257,0x3e7426,0xa6d46a]);
 const fl=add(G());
 for(let i=0;i<260;i++){const x=rnd(0,W),y=rnd(hillY(x)+10,H);fl.beginFill(0xf6e05a,.8).drawCircle(x,y,rnd(1,2.2)).endFill();}
 for(let i=0;i<900;i++){const x=rnd(W*.55,W),y=rnd(Math.max(hillY(x)+40,H*.72),H);
  fl.lineStyle(rnd(2,4),i%2?0x9a70c8:0xb890e0,rnd(.4,.8)).moveTo(x,y).lineTo(x+rnd(-2,2),y-rnd(6,18));}
 still(fl);
}
