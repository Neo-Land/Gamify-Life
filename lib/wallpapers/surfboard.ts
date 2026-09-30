import type {Container} from 'pixi.js';
import type {Pixi,Updater} from './kit';
/** Neo's hovering chrome shortboard, ported from the reference. Drawn once into a 2x canvas, then
 * animated as sprites in the crisp `fg` layer (outside the dither shader). The character is a DOM
 * element above the canvas: `onRide(dy,roll)` hands it the board's bob and roll each frame.
 * One change from the reference: the board sits at the character's anchor (`cx`,`cy`) from
 * lib/home-scene.ts rather than a fixed (W/2, H*.66), so the character-position setting still works. */
export type SurfStyle={sky:string;ground:string;glow:number};
export function surfboard(PIXI:Pixi,fg:Container,{W,cx,cy,st,rnd,anim,clock,onRide}:{W:number;cx:number;cy:number;st:SurfStyle;rnd:(a:number,b:number)=>number;anim:Updater[];clock:{T:number};onRide?:(dy:number,roll:number)=>void}){
 const L=Math.min(W<700?W*.72:W*.34,420),BW=L*.28,sq=.56,th=L*.024,k=2;           // length, true width, perspective squash, rail depth, supersample
 const cw=Math.ceil(L+60),ch=Math.ceil(BW*sq+L*.2+60),ox=cw/2,oy=24+BW*sq/2;
 const c=document.createElement('canvas');c.width=cw*k;c.height=ch*k;const x=c.getContext('2d')!;x.scale(k,k);
 const half=(t:number)=>BW/2*Math.pow(Math.sin(Math.PI*(.04+.96*Math.pow(t,1.12))),.62)*(t<.07?Math.sqrt(Math.max(t,.0005)/.07)*.6+.4:1); // round-pin tail -> pointed nose
 const rock=(t:number)=>L*.03*Math.pow(Math.max(0,t-.74)/.26,2)+L*.008*Math.pow(Math.max(0,.1-t)/.1,2); // nose rocker + tail kick
 const X=(t:number)=>ox-L/2+t*L,N=120;
 const outline=(dy=0,f=1,t0=0,t1=1)=>{x.beginPath();
  for(let i=0;i<=N;i++){const t=t0+(t1-t0)*i/N;x.lineTo(X(t),oy-rock(t)-half(t)*sq*f+dy);}
  for(let i=N;i>=0;i--){const t=t0+(t1-t0)*i/N;x.lineTo(X(t),oy-rock(t)+half(t)*sq*f+dy);}x.closePath();};
 const edge=(sign:number,dy=0,f=1)=>{x.beginPath();for(let i=0;i<=N;i++){const t=i/N;x.lineTo(X(t),oy-rock(t)+sign*half(t)*sq*f+dy);}};
 const top=oy-BW*sq/2,bot=oy+BW*sq/2;
 // fin (under the tail) + coiled leash
 const ft=.09,fx=X(ft),fy=oy+half(ft)*sq+th-2,fh=L*.1;
 let g=x.createLinearGradient(fx-10,fy,fx+16,fy+fh);g.addColorStop(0,'#2b3037');g.addColorStop(.45,'#9aa4ae');g.addColorStop(.6,'#e6ebf0');g.addColorStop(1,'#4a525b');
 x.fillStyle=g;x.beginPath();x.moveTo(fx-L*.03,fy);x.lineTo(fx+L*.035,fy);x.quadraticCurveTo(fx+L*.005,fy+fh*.5,fx-L*.035,fy+fh);x.quadraticCurveTo(fx-L*.02,fy+fh*.4,fx-L*.03,fy);x.fill();
 x.strokeStyle='#1c2026';x.lineWidth=.8;x.stroke();
 const lx=X(.015),ly=oy+th*.5;x.lineCap='round';
 for(const [col,w] of [['#1e2228',1.8],['#6d7782',.6]] as const){x.strokeStyle=col;x.lineWidth=w;x.beginPath();
  for(let i=0;i<=90;i++){const a=i*.75,q=i/90;x.lineTo(lx-2-q*L*.07+Math.cos(a)*2.4,ly+Math.sin(q*Math.PI)*L*.05+q*L*.02+Math.sin(a)*1.4-(w<1?.5:0));}x.stroke();}
 // rail (visible thickness), lit from below by the ground colour
 g=x.createLinearGradient(0,top,0,bot+th);g.addColorStop(0,'#2a3036');g.addColorStop(.55,'#8e98a2');g.addColorStop(.8,st.ground);g.addColorStop(1,'#20252a');
 outline(th);x.fillStyle=g;x.fill();x.strokeStyle='#15181c';x.lineWidth=1;x.stroke();
 // deck: banded chrome across the width
 g=x.createLinearGradient(0,top,0,bot);
 ([[0,'#ffffff'],[.1,'#c9d1d9'],[.28,'#7b848e'],[.4,'#eef2f6'],[.52,'#9aa3ad'],[.62,'#5f6872'],[.78,'#dfe5ea'],[.9,'#aab3bc'],[1,'#f4f7fa']] as const).forEach(([o,cl])=>g.addColorStop(o,cl));
 outline();x.fillStyle=g;x.fill();
 x.save();outline();x.clip();
 // chrome variation along the length
 g=x.createLinearGradient(X(0),0,X(1),0);([[0,'rgba(0,0,0,.18)'],[.2,'rgba(255,255,255,.12)'],[.45,'rgba(0,0,0,.14)'],[.7,'rgba(255,255,255,.2)'],[1,'rgba(0,0,0,.1)']] as const).forEach(([o,cl])=>g.addColorStop(o,cl));
 x.fillStyle=g;x.fillRect(0,0,cw,ch);
 // sky reflection on the upper half
 g=x.createLinearGradient(0,top,0,oy);g.addColorStop(0,st.sky);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=.35;x.fillStyle=g;x.fillRect(0,0,cw,ch);x.globalAlpha=1;
 // brushed-metal micro lines
 for(let i=0;i<260;i++){const y=rnd(top,bot),a=rnd(X(0),X(.9));x.strokeStyle=i%2?'rgba(255,255,255,.09)':'rgba(0,0,0,.07)';x.lineWidth=.5;
  x.beginPath();x.moveTo(a,y);x.lineTo(a+rnd(20,L*.4),y+rnd(-.4,.4));x.stroke();}
 // diagonal specular streaks
 ([[.3,26,.55],[.36,8,.8],[.66,18,.4],[.7,5,.7]] as const).forEach(([t,w,a])=>{const sx=X(t);g=x.createLinearGradient(sx-w,0,sx+w,0);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,`rgba(255,255,255,${a})`);g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.beginPath();x.moveTo(sx-w+14,top-4);x.lineTo(sx+w+14,top-4);x.lineTo(sx+w-14,bot+4);x.lineTo(sx-w-14,bot+4);x.fill();});
 // traction pad (tail): grooved rubber with an arch bar and kick
 outline(0,.8,.02,.155);x.fillStyle='#34383e';x.fill();
 x.save();outline(0,.8,.02,.155);x.clip();
 for(let t=.025;t<.155;t+=.007){x.strokeStyle='rgba(90,97,106,.8)';x.lineWidth=.8;x.beginPath();x.moveTo(X(t),top);x.lineTo(X(t)+3,bot);x.stroke();}
 x.fillStyle='rgba(120,128,138,.7)';x.fillRect(X(.085),top,L*.008,bot-top);x.fillStyle='rgba(150,158,168,.8)';x.fillRect(X(.024),top,L*.009,bot-top);
 x.restore();
 outline(0,.8,.02,.155);x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=.7;x.stroke();
 // pinstripe inlay near the rail + stringer
 edge(-1,0,.84);x.strokeStyle='rgba(38,44,52,.55)';x.lineWidth=.8;x.stroke();edge(-1,.8,.84);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.5;x.stroke();
 edge(1,0,.84);x.strokeStyle='rgba(38,44,52,.45)';x.lineWidth=.8;x.stroke();
 x.beginPath();for(let i=0;i<=N;i++){const t=.16+.81*i/N;x.lineTo(X(t),oy-rock(t));}x.strokeStyle='#4a525b';x.lineWidth=1.4;x.stroke();
 x.beginPath();for(let i=0;i<=N;i++){const t=.16+.81*i/N;x.lineTo(X(t),oy-rock(t)-.9);}x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=.5;x.stroke();
 // leash plug
 x.fillStyle='#1b1e22';x.beginPath();x.arc(X(.032),oy-rock(.032),3.2,0,7);x.fill();x.fillStyle='#b8c1ca';x.beginPath();x.arc(X(.032),oy-rock(.032),1.4,0,7);x.fill();
 // engraved monogram near the nose
 x.save();x.translate(X(.66),oy-rock(.66));x.scale(1,sq*1.6);x.font=`italic bold ${Math.round(L*.045)}px Georgia,serif`;x.textAlign='center';x.textBaseline='middle';
 x.fillStyle='rgba(255,255,255,.7)';x.fillText('NEO',.6,.6);x.fillStyle='rgba(40,46,54,.6)';x.fillText('NEO',0,0);x.restore();
 x.restore(); // end deck clip
 // edge highlights
 edge(-1);x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=1.3;x.stroke();
 edge(1);x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=.8;x.stroke();
 edge(1,th);x.strokeStyle='#121417';x.lineWidth=1;x.stroke();

 // ---- assemble in Pixi
 const B=new PIXI.Container();B.position.set(cx,cy);fg.addChild(B);
 const glow=new PIXI.Graphics();glow.filters=[new PIXI.BlurFilter(18,4)];glow.beginFill(st.glow,.55).drawEllipse(0,L*.12,L*.36,L*.06).endFill();B.addChild(glow);
 const trail=new PIXI.Container(),bits:{p:InstanceType<Pixi['Graphics']>;life:number;vx:number;vy:number}[]=[];B.addChild(trail);
 for(let i=0;i<34;i++){const p=new PIXI.Graphics().beginFill(i%3?0xffffff:st.glow).drawRect(-1.5,-1.5,3,3).endFill();p.alpha=0;trail.addChild(p);bits.push({p,life:rnd(0,1),vx:-40,vy:0});}
 const tex=PIXI.Texture.from(c),spr=new PIXI.Sprite(tex);spr.scale.set(1/k);spr.anchor.set(ox/cw,oy/ch);B.addChild(spr);
 // travelling shine, masked to the board silhouette
 const sc=document.createElement('canvas');sc.width=80;sc.height=8;const sx=sc.getContext('2d')!,sg=sx.createLinearGradient(0,0,80,0);
 sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.75)');sg.addColorStop(1,'rgba(255,255,255,0)');sx.fillStyle=sg;sx.fillRect(0,0,80,8);
 const shine=new PIXI.Sprite(PIXI.Texture.from(sc));shine.anchor.set(.5);shine.height=ch*1.2;shine.skew.x=-.5;shine.blendMode=PIXI.BLEND_MODES.ADD;shine.visible=false;
 const m=new PIXI.Sprite(tex);m.scale.set(1/k);m.anchor.set(ox/cw,oy/ch);B.addChild(m,shine);shine.mask=m;
 // nose glint
 const star=new PIXI.Graphics().beginFill(0xffffff).drawPolygon([0,-9,1.6,-1.6,9,0,1.6,1.6,0,9,-1.6,1.6,-9,0,-1.6,-1.6]).endFill();
 star.position.set(L/2-L*.06,-rock(.94)-half(.94)*sq*.5);star.alpha=0;B.addChild(star);
 anim.push(dt=>{const T=clock.T;
  B.y=cy+Math.sin(T*1.2)*7;B.rotation=Math.sin(T*.9)*.022;
  glow.alpha=.75+.25*Math.sin(T*2.4);
  const p=(T%5)/1.3;shine.visible=p<1;shine.x=-L/2-60+p*(L+120);
  star.alpha=Math.max(0,Math.sin(T*1.7))**6;star.rotation=T*.8;star.scale.set(.6+star.alpha*.6);
  bits.forEach(b=>{b.life+=dt*.9;if(b.life>1){b.life=0;b.p.x=-L/2+rnd(0,10);b.p.y=rnd(-4,th+4);b.vx=rnd(-60,-25);b.vy=rnd(-6,14);}
   b.p.x+=b.vx*dt;b.p.y+=b.vy*dt;b.p.alpha=1-b.life;});
  onRide?.(B.y-cy,B.rotation);
 });
 return {length:L};
}
