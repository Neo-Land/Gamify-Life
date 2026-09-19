/** Hair art, authored as axis-aligned boxes in the pre-scale head space (head box x86–170,
 * y44–134, scaled x2 about 128,140). Boxes rather than path strings because every edge has to
 * stay orthogonal: `shapeRendering:crispEdges` turns any diagonal in a `d` attribute into a
 * visibly wrong stair. Each style carries its own front, side and back view — left and right are
 * the same side art, mirrored in CSS. Keep everything inside x∈[66,190] or it leaves the canvas. */
export type Box=[number,number,number,number];
export type HairView='front'|'side'|'back';
export type HairArt={back:Box[];front:Box[];light:Box[];tie:Box[]};
export const boxPath=(boxes:Box[])=>boxes.map(([x,y,w,h])=>`M${x} ${y}h${w}v${h}h${-w}z`).join('');

// Skull caps every style starts from. The side cap reaches x172 so a fringe can sit on the brow.
const capF:Box[]=[[102,30,52,6],[96,34,64,4],[92,38,72,4],[88,42,80,4],[86,46,84,16]];
const capS:Box[]=[[106,30,54,6],[100,34,64,4],[96,38,70,4],[94,42,76,4],[92,46,80,16]];
const capB:Box[]=[[102,30,52,6],[96,34,64,4],[92,38,72,4],[88,42,80,4],[86,46,84,46]];
const browF:Box[]=[[88,62,80,7]];
const browS:Box[]=[[92,62,46,18],[148,62,24,7]];
const napeS:Box[]=[[92,62,42,26]];
const liteF:Box[]=[[96,38,26,5],[140,36,22,5]];
const liteS:Box[]=[[102,38,28,5],[140,36,20,5]];
const liteB:Box[]=[[98,40,28,5],[142,38,22,5]];
const sideburn:Box[]=[[86,68,12,14],[158,68,12,14]];
/** A rope of hair — braids, locs and twists are all this with different rhythms. */
const rope=(x:number,y:number,len:number,w:number,kink:number):Box[]=>{
 const out:Box[]=[];for(let i=0;i<len;i++){const o=kink?(i%2?kink:-kink):0;out.push([x-w/2+o,y+i*12,w,8],[x-w/2-2+o,y+i*12+7,w+4,6]);}return out;};
const strands=(xs:number[],y:number,len:number,w:number,kink:number)=>xs.flatMap(x=>rope(x,y,len,w,kink));

const styles:Record<string,Record<HairView,HairArt>>={
 bald:{front:{back:[],front:[],light:[],tie:[]},side:{back:[],front:[],light:[],tie:[]},back:{back:[],front:[],light:[],tie:[]}},
 crop:{
  front:{back:[],front:[...capF,...browF,...sideburn],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...browS,[86,50,10,30]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[86,92,84,8]],light:liteB,tie:[]}},
 pixie:{
  front:{back:[],front:[...capF,[88,62,18,12],[110,62,14,9],[130,62,16,12],[152,62,16,9],[84,56,8,18],[164,56,8,18]],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...napeS,[146,62,20,10],[166,62,8,6],[86,52,10,26]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[86,92,84,10],[90,102,24,8],[142,102,24,8]],light:liteB,tie:[]}},
 undercut:{
  front:{back:[],front:[[96,24,64,6],[90,28,76,6],[86,34,84,24],[86,56,84,5]],light:[[94,34,28,5],[140,32,22,5]],tie:[]},
  side:{back:[],front:[[100,24,66,6],[94,28,76,6],[92,34,80,24],[92,56,80,5]],light:liteS,tie:[]},
  back:{back:[],front:[[96,24,64,6],[90,28,76,6],[86,34,84,24],[86,56,84,5]],light:liteB,tie:[]}},
 sidepart:{
  front:{back:[],front:[...capF,[86,62,58,9],[86,71,32,8],[144,62,26,7],[84,56,8,20]],light:[[100,38,30,5],[146,40,18,4]],tie:[]},
  side:{back:[],front:[...capS,...napeS,[124,62,48,9],[124,71,26,7]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[86,92,84,8]],light:liteB,tie:[]}},
 waves:{
  front:{back:[],front:[...capF,...browF,...sideburn,[88,26,24,6],[120,24,24,6],[150,26,20,6]],light:[[92,44,30,5],[132,52,28,5],[96,56,26,4]],tie:[]},
  side:{back:[],front:[...capS,...browS,[92,26,26,6],[126,24,26,6],[152,28,18,6],[86,50,10,32]],light:[[98,44,30,5],[134,52,26,5]],tie:[]},
  back:{back:[],front:[...capB,[86,92,84,10],[88,26,24,6],[120,24,24,6],[150,26,20,6]],light:[[92,58,72,5],[92,76,72,5]],tie:[]}},
 curls:{
  front:{back:[],front:[...capF,[86,24,16,10],[104,20,18,10],[124,22,18,10],[144,20,16,10],[80,40,10,22],[166,40,10,22],[88,62,16,10],[106,64,16,10],[126,62,16,10],[146,64,16,10]],light:[[94,36,12,6],[122,32,12,6],[148,36,10,6]],tie:[]},
  side:{back:[],front:[...capS,...browS,[92,24,18,10],[112,20,18,10],[132,22,18,10],[152,24,16,10],[84,42,10,26],[86,66,18,12]],light:[[100,36,12,6],[130,32,12,6]],tie:[]},
  back:{back:[],front:[...capB,[86,24,16,10],[104,20,18,10],[124,22,18,10],[144,20,16,10],[86,92,84,10],[88,100,18,10],[110,102,18,10],[134,100,18,10]],light:[[96,58,16,6],[132,70,16,6]],tie:[]}},
 afro:{
  front:{back:[],front:[[100,12,56,6],[90,18,76,6],[82,24,92,6],[76,30,104,8],[72,38,112,20],[94,58,68,8],[72,58,24,34],[160,58,24,34],[76,92,16,12],[164,92,16,12]],light:[[92,26,24,6],[146,24,20,6]],tie:[]},
  side:{back:[],front:[[104,12,58,6],[94,18,80,6],[86,24,90,6],[80,30,98,8],[76,38,104,20],[100,58,64,8],[76,58,26,36],[80,94,18,12]],light:[[98,26,26,6],[144,24,18,6]],tie:[]},
  back:{back:[],front:[[100,12,56,6],[90,18,76,6],[82,24,92,6],[76,30,104,8],[72,38,112,56],[78,94,100,8],[88,102,80,8]],light:[[92,26,24,6],[146,24,20,6],[96,58,24,6]],tie:[]}},
 coils:{
  front:{back:[],front:[[102,16,52,6],[92,22,72,6],[84,28,88,6],[78,34,100,8],[74,42,108,18],[96,60,64,8],[74,60,22,32],[160,60,22,32],[78,92,16,10],[162,92,16,10]],light:[[92,30,10,6],[110,26,10,6],[130,30,10,6],[148,34,10,6],[96,50,10,6],[132,54,10,6],[86,66,10,6],[156,66,10,6]],tie:[]},
  side:{back:[],front:[[106,16,54,6],[96,22,76,6],[88,28,86,6],[82,34,94,8],[78,42,102,18],[102,60,60,8],[78,60,24,34],[82,94,16,10]],light:[[98,30,10,6],[118,26,10,6],[138,30,10,6],[102,52,10,6],[88,66,10,6]],tie:[]},
  back:{back:[],front:[[102,16,52,6],[92,22,72,6],[84,28,88,6],[78,34,100,8],[74,42,108,52],[80,94,96,8],[88,102,80,8]],light:[[92,30,10,6],[112,26,10,6],[132,30,10,6],[98,60,10,6],[134,64,10,6],[100,80,10,6]],tie:[]}},
 bob:{
  front:{back:[[82,44,92,74]],front:[...capF,...browF,[80,56,14,62],[162,56,14,62],[74,110,20,14],[162,110,20,14]],light:liteF,tie:[]},
  side:{back:[[88,44,52,78]],front:[...capS,...browS,[86,52,14,62],[80,110,22,14]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[84,44,88,74],[78,110,22,14],[156,110,22,14]],light:[[96,58,24,6],[140,64,20,6]],tie:[]}},
 long:{
  front:{back:[[80,46,96,108]],front:[...capF,...browF,[76,56,16,98],[164,56,16,98],[72,124,20,32],[164,124,20,32]],light:liteF,tie:[]},
  side:{back:[[86,44,54,116]],front:[...capS,...browS,[84,54,14,104],[80,126,20,32]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[82,44,92,114],[78,128,20,30],[158,128,20,30]],light:[[96,58,24,6],[138,70,22,6]],tie:[]}},
 braids:{
  front:{back:[],front:[...capF,...browF,...strands([82,174],58,7,14,3)],light:liteF,tie:[[74,56,14,6],[170,56,14,6]]},
  side:{back:[],front:[...capS,...napeS,...strands([84],58,7,14,3),[148,62,24,7]],light:liteS,tie:[[78,56,14,6]]},
  back:{back:[],front:[...capB,...strands([104,152],92,6,16,3)],light:liteB,tie:[[96,90,18,6],[144,90,18,6]]}},
 locs:{
  front:{back:[],front:[...capF,...browF,...strands([80,96,158,174],56,6,10,0)],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...napeS,...strands([84,100,116],56,6,10,0),[150,62,22,7]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,...strands([94,112,130,148,166],88,5,11,0)],light:liteB,tie:[]}},
 twists:{
  front:{back:[],front:[...capF,...browF,...strands([82,100,154,172],56,6,13,2)],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...napeS,...strands([84,102],56,6,13,2),[150,62,22,7]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,...strands([98,124,150],88,5,14,2)],light:liteB,tie:[]}},
 bun:{
  front:{back:[[110,4,36,8],[102,10,52,12],[98,22,60,12]],front:[...capF,...browF,[102,30,52,6]],light:[[108,14,18,6],...liteF],tie:[[112,32,32,7]]},
  side:{back:[[76,18,38,10],[70,26,48,20]],front:[...capS,...browS,[86,52,14,34]],light:liteS,tie:[[92,32,18,8]]},
  back:{back:[],front:[...capB,[110,2,36,8],[102,8,52,10],[96,18,64,16],[102,34,52,8],[110,42,36,6]],light:[[108,12,20,6],[100,60,26,5]],tie:[[100,48,56,8]]}},
 ponytail:{
  // Gathered high at the back of the skull, then falling away behind the shoulder.
  front:{back:[[166,54,14,54],[162,104,16,30]],front:[...capF,...browF],light:liteF,tie:[]},
  side:{back:[[84,58,24,18],[76,74,22,20],[70,92,20,22],[70,112,18,24],[70,134,18,20],[76,152,18,12]],
   front:[...capS,[92,50,42,24],...browS],light:liteS,tie:[[88,54,20,10]]},
  back:{back:[],front:[...capB,[112,66,32,14],[110,80,36,24],[106,102,44,28],[110,128,36,24],[116,150,24,14]],light:[[100,40,26,5]],tie:[[110,62,36,8]]}}
};
export const hairArt=(style:string,view:HairView):HairArt=>(styles[style]||styles.crop)[view];
export const hairStyleIds=Object.keys(styles);
