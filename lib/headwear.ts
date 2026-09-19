/** Headwear and face accessories, authored as axis-aligned boxes in the same pre-scale head space
 * as lib/hair.ts (head box x86–170, y44–134; keep everything inside x∈[66,190]).
 * Every item gets its own silhouette — before this, bandana and rain hood both fell through to the
 * baseball cap, and all six pairs of glasses were the same frame with a different lens tint. */
import type {Box} from './hair';
export type {Box};
export type HatArt={main:Box[];accent:Box[];dark:Box[]};
export type HatView='front'|'side'|'back';
const none:HatArt={main:[],accent:[],dark:[]};

const hats:Record<string,Record<HatView,HatArt>>={
 bucket:{
  front:{main:[[96,24,64,8],[92,32,72,22],[74,54,108,8],[78,62,100,6]],accent:[[92,46,72,6]],dark:[[74,60,108,3]]},
  side:{main:[[100,24,62,8],[96,32,70,22],[80,54,104,8],[84,62,96,6]],accent:[[96,46,70,6]],dark:[[80,60,104,3]]},
  back:{main:[[96,24,64,8],[92,32,72,22],[74,54,108,8],[78,62,100,6]],accent:[[92,46,72,6]],dark:[[74,60,108,3]]}},
 beanie:{
  front:{main:[[104,24,48,6],[96,30,64,6],[90,36,76,18],[88,54,80,12]],accent:[[114,14,28,10],[118,8,20,8]],dark:[[88,64,80,3]]},
  side:{main:[[108,24,48,6],[100,30,64,6],[94,36,76,18],[92,54,80,12]],accent:[[92,14,28,10],[96,8,20,8]],dark:[[92,64,80,3]]},
  back:{main:[[104,24,48,6],[96,30,64,6],[90,36,76,18],[88,54,80,12]],accent:[[114,14,28,10],[118,8,20,8]],dark:[[88,64,80,3]]}},
 beret:{
  front:{main:[[102,22,70,6],[92,28,88,8],[86,36,96,10],[90,46,84,7]],accent:[[134,14,14,8]],dark:[[90,50,84,3]]},
  side:{main:[[104,22,68,6],[94,28,84,8],[88,36,92,10],[92,46,80,7]],accent:[[136,14,14,8]],dark:[[92,50,80,3]]},
  back:{main:[[98,22,70,6],[86,28,88,8],[80,36,96,10],[88,46,84,7]],accent:[[112,14,14,8]],dark:[[88,50,84,3]]}},
 sun:{
  front:{main:[[100,22,56,6],[96,28,64,16],[66,50,124,8],[72,58,112,5]],accent:[[94,42,68,7]],dark:[[66,56,124,3]]},
  side:{main:[[104,22,54,6],[100,28,62,16],[74,50,116,8],[80,58,104,5]],accent:[[98,42,66,7]],dark:[[74,56,116,3]]},
  back:{main:[[100,22,56,6],[96,28,64,16],[66,50,124,8],[72,58,112,5]],accent:[[94,42,68,7]],dark:[[66,56,124,3]]}},
 headband:{
  front:{main:[[84,50,88,13]],accent:[[84,53,88,4]],dark:[[76,52,8,10],[172,52,8,10]]},
  side:{main:[[90,50,84,13]],accent:[[90,53,84,4]],dark:[[82,52,8,10]]},
  back:{main:[[84,50,88,13]],accent:[[92,53,26,4]],dark:[[118,48,20,18],[112,64,12,14],[132,64,12,14]]}},
 bow:{
  front:{main:[[86,52,84,7],[98,26,24,18],[134,26,24,18]],accent:[[102,30,10,10],[140,30,10,10]],dark:[[120,28,16,14]]},
  side:{main:[[92,52,80,7],[104,26,24,18]],accent:[[108,30,10,10]],dark:[[126,28,14,14]]},
  back:{main:[[86,52,84,7],[98,26,24,18],[134,26,24,18]],accent:[[102,30,10,10],[140,30,10,10]],dark:[[120,28,16,14]]}},
 earmuffs:{
  front:{main:[[100,26,56,6],[92,30,72,6],[88,36,80,5],[70,56,26,36],[160,56,26,36]],accent:[[74,62,18,24],[164,62,18,24]],dark:[[70,88,26,4],[160,88,26,4]]},
  side:{main:[[104,26,56,6],[96,30,72,6],[92,36,78,5],[86,56,30,38]],accent:[[90,62,22,26]],dark:[[86,90,30,4]]},
  back:{main:[[100,26,56,6],[92,30,72,6],[88,36,80,5],[70,56,26,36],[160,56,26,36]],accent:[[74,62,18,24],[164,62,18,24]],dark:[[70,88,26,4],[160,88,26,4]]}},
 cap:{
  front:{main:[[98,24,60,6],[92,30,72,20],[84,50,92,8],[90,58,80,6]],accent:[[122,20,12,6]],dark:[[84,56,92,3]]},
  side:{main:[[100,24,60,6],[94,30,72,20],[92,50,90,8],[100,58,82,6]],accent:[[124,20,12,6]],dark:[[92,56,90,3]]},
  back:{main:[[98,24,60,6],[92,30,72,20],[92,50,72,7]],accent:[[122,20,12,6],[112,52,32,5]],dark:[[92,47,72,4]]}},
 bandana:{
  // Tied at one side: a wrapped cloth with a knot and two tails, plus a printed pattern.
  front:{main:[[94,34,68,6],[86,40,84,22]],accent:[[96,44,6,6],[112,48,6,6],[128,44,6,6],[144,48,6,6],[104,54,6,6],[136,54,6,6]],dark:[[168,46,14,14],[176,58,10,18],[180,72,8,14]]},
  side:{main:[[98,34,68,6],[92,40,80,22]],accent:[[102,44,6,6],[118,48,6,6],[134,44,6,6],[150,48,6,6]],dark:[[84,46,14,14],[74,58,12,18],[68,72,10,14]]},
  back:{main:[[94,34,68,6],[86,40,84,22]],accent:[[96,44,6,6],[112,48,6,6],[128,44,6,6],[144,48,6,6]],dark:[[168,46,14,14],[176,58,10,18],[180,72,8,14]]}},
 hood:{
  // A ring around the face, not a cap: crown, two cheek panels and a neck band.
  front:{main:[[88,26,80,8],[80,34,96,10],[72,44,22,74],[162,44,22,74],[76,118,32,10],[148,118,32,10]],accent:[[80,34,96,6],[76,48,10,64],[170,48,10,64]],dark:[[72,112,22,6],[162,112,22,6]]},
  side:{main:[[96,26,74,8],[88,34,88,10],[80,44,26,74],[84,118,40,10]],accent:[[88,34,88,6],[84,48,12,64]],dark:[[80,112,26,6]]},
  back:{main:[[88,24,80,8],[80,32,96,10],[76,42,104,68],[72,104,112,12]],accent:[[80,32,96,6],[100,50,56,6]],dark:[[72,112,112,4]]}},
 helmet:{
  front:{main:[[96,20,64,6],[88,26,80,8],[84,34,88,26],[82,58,14,30],[160,58,14,30]],accent:[[92,30,20,6],[140,30,20,6]],dark:[[94,32,10,26],[122,28,12,30],[150,32,10,26]]},
  side:{main:[[100,20,64,6],[92,26,82,8],[88,34,88,26],[86,58,14,30]],accent:[[98,30,22,6]],dark:[[100,30,10,28],[128,28,12,30]]},
  back:{main:[[96,20,64,6],[88,26,80,8],[84,34,88,26],[82,58,14,30],[160,58,14,30]],accent:[[92,30,20,6],[140,30,20,6]],dark:[[94,32,10,26],[122,28,12,30],[150,32,10,26]]}},
 visor:{
  front:{main:[[84,48,88,13],[78,61,100,7],[84,68,88,5]],accent:[[84,51,88,4]],dark:[[78,66,100,3]]},
  side:{main:[[90,48,84,13],[92,61,96,7],[100,68,84,5]],accent:[[90,51,84,4]],dark:[[92,66,96,3]]},
  back:{main:[[84,48,88,13]],accent:[[84,51,88,4]],dark:[[112,46,32,18]]}}
};
/** Item ids carry a slot prefix and free-text names, so map them onto the art above. */
export function hatArt(id:string,legacy:string,view:HatView):HatArt{
 const s=`${id} ${legacy}`.toLowerCase();
 const key=s.includes('bucket')?'bucket':s.includes('beanie')?'beanie':s.includes('beret')?'beret':s.includes('sun')?'sun'
  :s.includes('headband')?'headband':s.includes('bow')?'bow':s.includes('earmuff')?'earmuffs':s.includes('bandana')?'bandana'
  :s.includes('hood')?'hood':s.includes('helmet')?'helmet':s.includes('visor')?'visor':s.includes('cap')?'cap':'';
 return key?hats[key][view]:none;
}

export type GlassArt={rim:Box[];lens:Box[];shine:Box[];opaque:boolean};
/** Rims have to be rings, not filled discs: a filled disc hides the eye it is supposed to sit in
 * front of, and no lens opacity brings it back. */
const ring=(cx:number,cy:number,rx:number,ry:number,t=3,band=3):Box[]=>{const out:Box[]=[];
 for(let dy=-ry;dy<ry;dy+=band){const m=dy+band/2,w=Math.round(rx*Math.sqrt(Math.max(0,1-(m/ry)**2)));if(w<1)continue;
  const iw=Math.abs(m)>=ry-t?0:Math.round((rx-t)*Math.sqrt(Math.max(0,1-(m/(ry-t))**2)));
  if(iw<1)out.push([cx-w,cy+dy,w*2,band]);else out.push([cx-w,cy+dy,w-iw,band],[cx+iw,cy+dy,w-iw,band]);}
 return out;};
const rectRing=(x:number,y:number,w:number,h:number,t=3):Box[]=>[[x,y,w,t],[x,y+h-t,w,t],[x,y+t,t,h-2*t],[x+w-t,y+t,t,h-2*t]];
const temple=(front:boolean):Box[]=>front?[[80,80,6,5],[170,80,6,5]]:[[84,82,8,5]];
/** Eyes sit at x93–121 and x135–163, y72–102, so every frame here is built around those two boxes. */
export function glassArt(id:string,legacy:string,side:boolean):GlassArt{
 const s=`${id} ${legacy}`.toLowerCase();
 if(s.includes('monocle'))return side
  ?{rim:ring(158,86,15,17,3),lens:[],shine:[[152,78,5,4]],opaque:false}
  :{rim:[...ring(149,86,17,19,3),[148,104,3,24],[138,127,12,3]],lens:[],shine:[[142,77,6,5]],opaque:false};
 if(s.includes('sport'))return side
  ?{rim:rectRing(140,70,34,26,3),lens:[[143,73,28,20]],shine:[[146,76,9,4]],opaque:true}
  :{rim:[...rectRing(84,68,88,30,3),[80,76,4,12],[172,76,4,12]],lens:[[87,71,82,24]],shine:[[93,75,14,5],[137,75,14,5]],opaque:true};
 if(s.includes('reading'))return side
  ?{rim:[...rectRing(150,86,20,16,2),...temple(false)],lens:[],shine:[[154,89,5,3]],opaque:false}
  :{rim:[...rectRing(91,86,32,16,2),...rectRing(133,86,32,16,2),[123,90,10,3],...temple(true)],lens:[],shine:[[96,89,8,3],[138,89,8,3]],opaque:false};
 if(s.includes('round'))return side
  ?{rim:ring(157,86,16,18,3),lens:[],shine:[[151,78,5,4]],opaque:false}
  :{rim:[...ring(107,86,18,20,3),...ring(149,86,18,20,3),[123,84,10,3],...temple(true)],lens:[],shine:[[99,77,6,5],[141,77,6,5]],opaque:false};
 if(s.includes('sun')||s.includes('goggle'))return side
  ?{rim:rectRing(146,70,28,30,3),lens:[[149,73,22,24]],shine:[[152,76,7,4]],opaque:true}
  :{rim:[...rectRing(88,70,40,32,3),...rectRing(128,70,40,32,3),[124,80,8,4],[82,76,6,12],[174,76,6,12]],lens:[[91,73,34,26],[131,73,34,26]],shine:[[95,76,10,5],[135,76,10,5]],opaque:true};
 return side
  ?{rim:[...rectRing(148,72,24,28,3),...temple(false)],lens:[],shine:[[152,77,6,4]],opaque:false}
  :{rim:[...rectRing(88,72,38,28,3),...rectRing(130,72,38,28,3),[124,82,8,3],...temple(true)],lens:[],shine:[[94,77,10,4],[136,77,10,4]],opaque:false};
}
