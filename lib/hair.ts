/** Hair art, authored as axis-aligned boxes in the pre-scale head space (head box x86–170,
 * y44–134, scaled x2.18 about 128,140). Boxes rather than path strings because every edge has to
 * stay orthogonal: `shapeRendering:crispEdges` turns any diagonal in a `d` attribute into a
 * visibly wrong stair. Each style carries its own front, side and back view — left and right are
 * the same side art, mirrored in CSS. Keep everything inside x∈[66,190] or it leaves the canvas.
 *
 * Reference points in this space:
 *   skull front x86–170  ·  skull side x84–170  ·  hairline y56  ·  brow y64–69  ·  eyes y75–95
 *   ear (side view) x118–131, y86–109  ·  chin and shoulder line y134  ·  waist y156  ·  feet y182
 * So short hair ends near y122 (nape), a bob near y130 (jaw), shoulder length near y140, and long
 * hair near y156 (waist). Lengths are chosen against those numbers rather than by eye.
 *
 * The previous art had three structural faults, all fixed by the primitives below:
 *   · the back view was one flat rectangle — `capB` filled y46–92 at full width and `backShort`
 *     squared it off at y116 — so every style read as the same slab from behind;
 *   · the side view was a slab too (`sideShort` was a single 58×30 rect), with no occipital curve,
 *     so hair either floated off the skull or ballooned past it;
 *   · long styles drew a plain rectangular sheet behind the body and plain rectangular columns in
 *     front, so "long hair" was three rectangles.
 * Every primitive now follows the skull's rounded-square silhouette, sits a few pixels proud of it
 * so it reads as hair with thickness rather than paint, and tapers where hair tapers. */
export type Box=[number,number,number,number];
export type HairView='front'|'side'|'back';
/** `stub` is shaved hair: the hair colour at low opacity over skin, so it reads as stubble on any colour. */
export type HairArt={back:Box[];front:Box[];light:Box[];tie:Box[];stub?:Box[]};
export const boxPath=(boxes:Box[])=>boxes.map(([x,y,w,h])=>`M${x} ${y}h${w}v${h}h${-w}z`).join('');

/** The shell over the crown. Rows step outward exactly like the skull's own corners, then run
 * down the sides a little proud of the skull so the hair has thickness. */
const capF:Box[]=[[104,30,48,4],[97,34,62,4],[92,38,72,4],[88,42,80,4],[85,46,86,8]];
const capS:Box[]=[[107,30,48,4],[100,34,63,4],[95,38,73,4],[91,42,79,4],[84,46,88,8]];
const capB:Box[]=[[104,30,48,4],[97,34,62,4],[92,38,72,4],[88,42,80,4],[85,46,86,8]];
/** The hairline across the forehead, at y56. The temple tabs stop at x102/x154 so a raised brow
 * is never swallowed by the fringe. */
const browF:Box[]=[[86,54,84,4],[86,58,16,4],[154,58,16,4]];
const templeF:Box[]=[[83,54,6,22],[167,54,6,22]];
const sideburnF:Box[]=[[84,76,6,14],[166,76,6,14]];
const fringeS:Box[]=[[146,50,26,6],[146,56,26,4],[152,60,20,3]];
/** Side coverage for short hair: temple across to the ear, the occiput behind it, a sideburn in
 * front of it, and a nape that tapers into the neck. The ear sits clear in the gap at x118–131. */
const sideShort:Box[]=[[84,54,62,32],[84,86,34,24],[131,86,15,10],[86,110,30,6],[90,116,22,4],[96,120,12,3]];
/** Side coverage that hides the ear and falls to the jaw — bobs, curtains, long hair. */
const sideLong:Box[]=[[84,54,64,44],[84,98,60,22],[86,120,52,8],[90,128,42,4]];
/** The nape, seen from behind: full width down the skull, then three steps in. */
const backShort:Box[]=[[86,54,84,50],[86,104,84,8],[89,112,78,5],[95,117,66,4],[104,121,48,3]];
/** Hair in front of the ears, seen from behind. */
const backSides:Box[]=[[84,60,6,56],[166,60,6,56]];
/** Broad sheen across the crown, so a mass of hair is never one flat value. */
const liteF:Box[]=[[94,36,26,5],[138,34,22,5],[90,48,14,4]];
const liteS:Box[]=[[100,36,28,5],[140,34,20,5],[92,50,14,4]];
const liteB:Box[]=[[96,38,28,5],[140,36,22,5],[92,52,12,4]];
/** Strand lines down a short back mass, staggered so they never read as a grid. Styles whose back
 * view has no mass below the crown (undercut, mohawk) deliberately leave this out. */
const napeLite:Box[]=[[104,62,6,26],[146,70,6,22],[124,80,6,20]];

/** A rope of hair — braids, locs and twists are all this with different rhythms. The last two
 * segments narrow so a rope ends in a tip instead of a blunt stub. */
const rope=(x:number,y:number,len:number,w:number,kink:number):Box[]=>{
 const out:Box[]=[];
 for(let i=0;i<len;i++){const o=kink?(i%2?kink:-kink):0;
  const t=i<len-2?0:i===len-2?2:5,ww=Math.max(4,w-t);
  out.push([x-Math.floor(ww/2)+o,y+i*12,ww,8]);
  if(i<len-1)out.push([x-Math.floor(ww/2)-2+o,y+i*12+7,ww+4,6]);}
 return out;};
const strands=(xs:number[],y:number,len:number,w:number,kink:number)=>xs.flatMap(x=>rope(x,y,len,w,kink));
/** A falling mass that widens as it drops, in stepped bands — the shape the old plain rectangle
 * sheet was missing. */
const fall=(x0:number,x1:number,y0:number,y1:number,taper=0):Box[]=>{
 const out:Box[]=[],bands=5;
 for(let i=0;i<bands;i++){const ya=y0+Math.floor((y1-y0)*i/bands),yb=y0+Math.floor((y1-y0)*(i+1)/bands),g=Math.floor(taper*i/bands);
  out.push([x0-g,ya,(x1-x0)+g*2,yb-ya]);}
 return out;};
/** A rounded bun: stepped like the skull corners so it never reads as a floating block. */
const bun=(cx:number,y:number,w=30,h=26):Box[]=>{const a=Math.floor(w/2);
 return [[cx-a+4,y,w-8,4],[cx-a+1,y+4,w-2,4],[cx-a,y+8,w,h-16],[cx-a+1,y+h-8,w-2,4],[cx-a+4,y+h-4,w-8,4]];};

/** Curl clusters shared by curls / afro / coils. They overlap rather than abut, or the gaps
 * between them read as notches cut into the silhouette. */
const curlTopF:Box[]=[[84,24,22,14],[102,20,24,16],[122,23,24,15],[142,21,22,15],[78,38,14,26],
 [164,38,14,26],[86,50,20,12],[104,52,20,12],[124,50,20,12],[142,52,22,12]];
const curlTopS:Box[]=[[90,24,24,14],[110,20,24,16],[130,22,24,15],[150,24,22,13],[80,40,14,28],
 [80,66,14,26],[84,104,20,12],[142,50,22,12]];
const curlTopB:Box[]=[[84,24,22,14],[102,20,24,16],[122,23,24,15],[142,21,22,15],[78,38,14,28],
 [164,38,14,28],[86,102,22,13],[106,106,22,13],[126,106,22,13],[146,102,22,13]];

const styles:Record<string,Record<HairView,HairArt>>={
 bald:{front:{back:[],front:[],light:[],tie:[]},side:{back:[],front:[],light:[],tie:[]},back:{back:[],front:[],light:[],tie:[]}},

 // ---- short ----------------------------------------------------------------
 crop:{
  front:{back:[],front:[...capF,...browF,...templeF,...sideburnF],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...sideShort,...fringeS],light:liteS,tie:[]},
  back:{back:[],front:[...capB,...backShort,...backSides],light:[...liteB,...napeLite],tie:[]}},
 // Wispy and uneven: the fringe is cut into points rather than a solid bar.
 pixie:{
  front:{back:[],front:[...capF,[86,54,20,12],[108,54,14,8],[128,54,16,12],[150,54,18,8],
   [83,52,6,26],[167,52,6,26],[84,78,6,12],[166,78,6,12]],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...sideShort,[144,50,22,10],[166,50,6,6],[84,58,6,18],[84,100,6,14]],
   light:liteS,tie:[]},
  back:{back:[],front:[...capB,...backShort,...backSides,[90,112,14,8],[152,112,14,8]],
   light:[...liteB,...napeLite],tie:[]}},
 // Long on top, shaved at the sides. The shaved part is `stub`, never a second band of hair, and
 // it is kept to the temple and hairline so it can never wash across the eyes.
 undercut:{
  front:{back:[],front:[[96,22,64,6],[90,28,76,6],[86,34,84,22],[86,56,84,5]],
   light:[[94,32,28,5],[140,30,22,5]],tie:[],stub:[[86,61,10,32],[160,61,10,32],[88,93,8,12],[158,93,8,12]]},
  side:{back:[],front:[[100,22,66,6],[94,28,78,6],[92,34,80,22],[92,56,80,5]],light:liteS,tie:[],
   stub:[[86,61,32,48],[131,61,15,26],[88,109,24,6]]},
  back:{back:[],front:[[96,22,64,6],[90,28,76,6],[86,34,84,22],[86,56,84,5]],
   light:[[96,34,28,5],[140,32,22,5]],tie:[],stub:[[86,61,84,48],[89,109,78,6],[95,115,66,4]]}},
 sidepart:{
  front:{back:[],front:[...capF,[86,54,58,8],[86,62,34,7],[144,54,26,6],[83,54,6,26],[167,54,6,20]],
   light:[[100,38,30,5],[146,40,18,4],[92,58,18,4]],tie:[]},
  side:{back:[],front:[...capS,...sideShort,[124,50,48,9],[142,59,22,6]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,...backShort,...backSides],light:[...liteB,[100,62,34,5],[140,74,6,24]],tie:[]}},
 // Texture carried by the highlight rows; the crown is a continuous bumpy line, not detached bars.
 waves:{
  front:{back:[],front:[...capF,...browF,...templeF,...sideburnF,[88,26,22,8],[110,23,20,11],
   [132,25,22,9],[154,27,16,7]],
   light:[[92,42,30,4],[132,48,28,4],[96,52,26,3],[136,36,20,4]],tie:[]},
  side:{back:[],front:[...capS,...sideShort,...fringeS,[92,26,22,8],[114,23,20,11],[136,25,22,9],[158,27,14,7]],
   light:[[98,42,30,4],[134,48,26,4],[94,74,24,3],[100,92,20,3]],tie:[]},
  back:{back:[],front:[...capB,...backShort,...backSides,[88,26,22,8],[110,23,20,11],[132,25,22,9],[154,27,16,7]],
   light:[[92,58,34,4],[134,64,30,4],[98,76,30,4],[136,84,26,4],[106,96,28,4]],tie:[]}},
 curls:{
  front:{back:[],front:[...capF,...curlTopF],light:[[94,36,12,6],[122,32,12,6],[148,36,10,6]],tie:[]},
  side:{back:[],front:[...capS,...sideShort,...curlTopS],light:[[100,36,12,6],[130,32,12,6],[96,68,12,6]],tie:[]},
  back:{back:[],front:[...capB,...backShort,...curlTopB],light:[[96,58,16,6],[132,70,16,6],[108,88,16,6]],tie:[]}},
 afro:{
  front:{back:[],front:[[100,10,56,6],[90,16,76,6],[82,22,92,6],[76,28,104,8],[72,36,112,22],
   [94,50,68,8],[72,50,24,42],[160,50,24,42],[76,92,16,12],[164,92,16,12]],
   light:[[92,24,24,6],[146,22,20,6],[80,58,12,6]],tie:[]},
  side:{back:[],front:[[104,10,58,6],[94,16,80,6],[86,22,90,6],[80,28,98,8],[74,36,104,22],
   [100,50,64,8],[74,50,28,44],[78,94,20,12],[98,58,46,38],[96,94,28,10]],
   light:[[98,24,26,6],[144,22,18,6],[104,68,20,6]],tie:[]},
  back:{back:[],front:[[100,10,56,6],[90,16,76,6],[82,22,92,6],[76,28,104,8],[72,36,112,58],
   [78,94,100,8],[88,102,80,8]],
   light:[[92,24,24,6],[146,22,20,6],[96,56,24,6],[134,74,22,6]],tie:[]}},
 coils:{
  front:{back:[],front:[[102,14,52,6],[92,20,72,6],[84,26,88,6],[78,32,100,8],[74,40,108,20],
   [96,50,64,8],[74,52,22,40],[160,52,22,40],[78,92,16,10],[162,92,16,10]],
   light:[[92,28,10,6],[110,24,10,6],[130,28,10,6],[148,32,10,6],[96,50,10,6],[132,54,10,6],
    [84,66,10,6],[158,66,10,6]],tie:[]},
  side:{back:[],front:[[106,14,54,6],[96,20,76,6],[88,26,86,6],[82,32,94,8],[78,40,102,20],
   [102,50,60,8],[76,52,24,42],[80,94,16,10],[100,58,44,38],[96,94,28,10]],
   light:[[98,28,10,6],[118,24,10,6],[138,28,10,6],[102,52,10,6],[86,66,10,6],[114,76,10,6]],tie:[]},
  back:{back:[],front:[[102,14,52,6],[92,20,72,6],[84,26,88,6],[78,32,100,8],[74,40,108,54],
   [80,94,96,8],[88,102,80,8]],
   light:[[92,28,10,6],[112,24,10,6],[132,28,10,6],[98,58,10,6],[134,62,10,6],[100,78,10,6],[140,84,10,6]],tie:[]}},
 puff:{
  front:{back:[],front:[[112,0,32,6],[104,6,48,6],[98,12,60,6],[94,18,68,6],[92,24,72,8],
   ...capF,...browF,...templeF],light:[[106,8,18,6],[134,14,14,6]],tie:[]},
  side:{back:[],front:[[116,0,32,6],[108,6,48,6],[102,12,60,6],[98,18,68,6],[96,24,72,8],
   ...capS,...sideShort,...fringeS],light:[[110,8,20,6],[138,14,12,6]],tie:[]},
  back:{back:[],front:[[112,0,32,6],[104,6,48,6],[98,12,60,6],[94,18,68,6],[92,24,72,8],
   ...capB,...backShort,...backSides],light:[[106,8,18,6],[134,14,14,6],[98,60,26,5]],tie:[]}},
 mohawk:{
  front:{back:[],front:[[114,2,28,10],[110,12,36,10],[112,22,32,34]],light:[[120,8,14,8]],tie:[],
   stub:[[86,48,84,8],[84,56,10,26],[160,56,10,26],[120,8,16,8]]},
  side:{back:[],front:[[98,14,16,16],[120,2,24,28],[150,12,18,18],[96,30,78,24]],light:[[124,8,16,8]],tie:[],
   stub:[[86,52,86,6],[84,58,34,46],[131,58,15,24],[88,104,26,6],[94,110,16,4]]},
  back:{back:[],front:[[114,2,28,10],[110,12,36,10],[112,22,32,36]],light:[[120,8,14,8]],tie:[],
   stub:[[86,50,84,56],[89,106,78,6],[95,112,66,4]]}},

 // ---- medium ---------------------------------------------------------------
 bob:{
  front:{back:[[84,46,88,76]],
   front:[...capF,...browF,[80,54,12,64],[164,54,12,64],[77,106,14,18],[165,106,14,18],
    [79,124,11,6],[166,124,11,6]],
   light:[...liteF,[84,70,5,26],[167,70,5,26]],tie:[]},
  side:{back:[[88,46,54,80]],front:[...capS,...fringeS,...sideLong,[82,108,16,20],[84,128,12,5]],
   light:[...liteS,[94,70,6,30],[104,96,5,24]],tie:[]},
  back:{back:[],front:[...capB,[84,46,88,72],[80,108,14,20],[162,108,14,20],[86,118,84,8],
    [92,126,72,4],[82,126,12,4],[162,126,12,4]],
   light:[[96,56,24,6],[140,62,20,6],[100,82,6,34],[150,76,6,38],[124,92,6,30]],tie:[]}},
 // A centre parting: the cap stops short of the middle so skin shows between the two sweeps.
 curtains:{
  front:{back:[[84,46,88,66]],
   front:[[104,30,48,4],[97,34,62,4],[92,38,72,4],[88,42,38,14],[130,42,38,14],
    [79,54,26,56],[151,54,26,56],[83,106,20,16],[153,106,20,16]],
   light:[[96,40,22,5],[140,40,20,5],[86,68,5,26],[165,68,5,26]],tie:[]},
  side:{back:[[88,46,52,70]],front:[...capS,[146,50,26,8],[140,58,12,22],...sideLong,[82,106,20,18]],
   light:[...liteS,[96,72,6,28]],tie:[]},
  back:{back:[],front:[...capB,[84,46,88,64],[80,106,16,18],[160,106,16,18],[88,110,80,8],[96,118,64,4]],
   light:[[96,58,24,6],[140,64,20,6],[126,76,6,30]],tie:[]}},
 twists:{
  front:{back:[],front:[...capF,...browF,...templeF,...strands([82,174,90,166],58,5,14,2)],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...sideShort,[146,50,26,8],...strands([94,110],96,4,13,2)],light:liteS,tie:[]},
  back:{back:[],front:[...capB,...backShort,...strands([98,124,150],96,4,14,2)],light:liteB,tie:[]}},
 bun:{
  front:{back:bun(128,2,52,30),front:[...capF,...browF,...templeF,[102,30,52,6]],
   light:[[108,12,18,6],...liteF],tie:[[114,30,28,5]]},
  side:{back:bun(90,14,46,34),front:[...capS,...sideShort,...fringeS],light:liteS,tie:[[90,30,18,6]]},
  back:{back:[],front:[...capB,...backShort,...backSides,...bun(128,0,62,44)],
   light:[[108,10,20,6],[100,60,26,5]],tie:[[110,42,36,6]]}},
 'space-buns':{
  front:{back:[...bun(105,10),...bun(151,10)],front:[...capF,...browF,...templeF],
   light:[[98,16,11,6],[144,16,11,6],...liteF],tie:[[97,32,16,5],[143,32,16,5]]},
  side:{back:bun(100,10,32),front:[...capS,...sideShort,...fringeS],
   light:[[92,16,13,6],...liteS],tie:[[90,32,18,5]]},
  back:{back:[],front:[...capB,...backShort,...backSides,...bun(104,8,34),...bun(152,8,34)],
   light:[[96,14,13,6],[144,14,13,6]],tie:[[96,32,18,5],[144,32,18,5]]}},

 // ---- long -----------------------------------------------------------------
 // To the waist. The sheet behind the body is shaped and widens as it falls, and the light layer
 // runs strand lines down it, so it never reads as one rectangle again.
 long:{
  front:{back:fall(82,174,46,152,10),
   front:[...capF,...browF,[78,54,12,88],[166,54,12,88],[74,124,14,30],[168,124,14,30],
    [76,150,12,6],[168,150,12,6]],
   light:[...liteF,[82,70,5,40],[168,70,5,40],[80,118,5,28]],tie:[]},
  side:{back:fall(86,142,46,154,8),front:[...capS,...fringeS,...sideLong,[82,106,18,36],[78,138,14,18]],
   light:[...liteS,[94,70,6,34],[100,104,5,30]],tie:[]},
  back:{back:[],front:[...capB,[84,46,88,66],[80,100,96,40],[76,136,104,14],[82,150,92,6]],
   light:[[96,56,24,6],[140,62,20,6],[98,76,6,56],[124,84,6,52],[150,72,6,60],[86,112,5,36],[164,106,5,42]],tie:[]}},
 braids:{
  front:{back:[],front:[...capF,...browF,...strands([80,176],58,6,14,3)],light:liteF,
   tie:[[72,56,16,6],[168,56,16,6]]},
  side:{back:strands([106],96,5,14,3),front:[...capS,...sideShort,...fringeS,[98,88,18,10]],
   light:liteS,tie:[[98,90,18,6]]},
  back:{back:[],front:[...capB,...backShort,...strands([104,152],100,5,16,3)],light:liteB,
   tie:[[96,98,18,6],[144,98,18,6]]}},
 locs:{
  front:{back:[],front:[...capF,...browF,...strands([80,96,158,174],54,6,10,0)],light:liteF,tie:[]},
  side:{back:strands([100],98,5,10,0),
   front:[...capS,...sideShort,[146,50,26,8],...strands([90,104],100,5,10,0)],light:liteS,tie:[]},
  back:{back:[],front:[...capB,...backShort,...strands([94,112,130,148,164],98,5,11,0)],light:liteB,tie:[]}},
 // Gathered high at the back of the skull, then falling away behind the shoulder.
 ponytail:{
  front:{back:[[166,52,16,52],[162,102,18,34],[164,134,14,14]],front:[...capF,...browF,...templeF],
   light:[...liteF,[170,66,5,30]],tie:[]},
  side:{back:[[82,56,26,18],[74,72,24,22],[68,92,22,24],[68,114,20,26],[70,138,18,18],[76,154,16,10]],
   front:[...capS,...sideShort,...fringeS],light:[...liteS,[78,84,5,44]],tie:[[86,52,22,10]]},
  back:{back:[],front:[...capB,...backShort,...backSides,[112,64,32,14],[108,78,40,26],
    [104,104,48,30],[110,132,36,22],[116,152,24,12]],
   light:[[100,40,26,5],[118,86,6,40],[138,96,6,44]],tie:[[110,60,36,8]]}},
 pigtails:{
  front:{back:[[70,72,22,46],[66,112,24,30],[70,140,18,12],[164,72,22,46],[166,112,24,30],[168,140,18,12]],
   front:[...capF,...browF,...templeF],light:[...liteF,[74,84,5,30],[170,84,5,30]],
   tie:[[70,66,22,8],[164,66,22,8]]},
  side:{back:[[72,76,24,48],[68,118,24,28],[72,144,18,10]],front:[...capS,...sideShort,...fringeS],
   light:[...liteS,[76,88,5,32]],tie:[[74,70,24,8]]},
  back:{back:[],front:[...capB,...backShort,...backSides,[82,80,28,54],[78,132,30,26],[82,156,22,8],
    [146,80,28,54],[148,132,30,26],[152,156,22,8]],
   light:[...liteB,[88,92,6,36],[152,92,6,36]],tie:[[82,74,28,8],[146,74,28,8]]}}
};
export const hairArt=(style:string,view:HairView):HairArt=>(styles[style]||styles.crop)[view];
export const hairStyleIds=Object.keys(styles);
/** Grouped for the picker, so the three lengths are offered as three lengths. */
export const hairLengths:Record<'short'|'medium'|'long',string[]>={
 short:['bald','crop','pixie','undercut','sidepart','waves','curls','afro','coils','puff','mohawk'],
 medium:['bob','curtains','twists','bun','space-buns'],
 long:['long','braids','locs','ponytail','pigtails']};
