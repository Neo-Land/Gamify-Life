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
const capF:Box[]=[[102,30,52,6],[96,34,64,4],[92,38,72,4],[88,42,80,4],[86,46,84,8]];
const capS:Box[]=[[106,30,54,6],[100,34,64,4],[96,38,70,4],[94,42,76,4],[92,46,80,8]];
const capB:Box[]=[[102,30,52,6],[96,34,64,4],[92,38,72,4],[88,42,80,4],[86,46,84,46]];
const browF:Box[]=[[88,50,80,6]];
const browS:Box[]=[[92,56,46,24],[148,50,24,6]];
const napeS:Box[]=[[92,56,42,32]];
const liteF:Box[]=[[96,38,26,5],[140,36,22,5]];
const liteS:Box[]=[[102,38,28,5],[140,36,20,5]];
const liteB:Box[]=[[98,40,28,5],[142,38,22,5]];
const sideburn:Box[]=[[86,58,12,16],[158,58,12,16]];
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
  front:{back:[],front:[...capF,[88,50,18,12],[110,50,14,9],[130,50,16,12],[152,50,16,9],[84,48,8,18],[164,48,8,18]],light:liteF,tie:[]},
  side:{back:[],front:[...capS,...napeS,[146,50,20,10],[166,50,8,6],[86,50,10,26]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[86,92,84,10],[90,102,24,8],[142,102,24,8]],light:liteB,tie:[]}},
 undercut:{
  front:{back:[],front:[[96,24,64,6],[90,28,76,6],[86,34,84,24],[86,56,84,5]],light:[[94,34,28,5],[140,32,22,5]],tie:[]},
  side:{back:[],front:[[100,24,66,6],[94,28,76,6],[92,34,80,24],[92,56,80,5]],light:liteS,tie:[]},
  back:{back:[],front:[[96,24,64,6],[90,28,76,6],[86,34,84,24],[86,56,84,5]],light:liteB,tie:[]}},
 sidepart:{
  front:{back:[],front:[...capF,[86,50,58,9],[86,59,32,8],[144,50,26,7],[84,50,8,20]],light:[[100,38,30,5],[146,40,18,4]],tie:[]},
  side:{back:[],front:[...capS,...napeS,[124,50,48,9],[124,59,26,7]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[86,92,84,8]],light:liteB,tie:[]}},
 waves:{
  front:{back:[],front:[...capF,...browF,...sideburn,[88,26,24,6],[120,24,24,6],[150,26,20,6]],light:[[92,44,30,5],[132,52,28,5],[96,56,26,4]],tie:[]},
  side:{back:[],front:[...capS,...browS,[92,26,26,6],[126,24,26,6],[152,28,18,6],[86,50,10,32]],light:[[98,44,30,5],[134,52,26,5]],tie:[]},
  back:{back:[],front:[...capB,[86,92,84,10],[88,26,24,6],[120,24,24,6],[150,26,20,6]],light:[[92,58,72,5],[92,76,72,5]],tie:[]}},
 curls:{
  front:{back:[],front:[...capF,[86,24,16,10],[104,20,18,10],[124,22,18,10],[144,20,16,10],[80,40,10,22],[166,40,10,22],[88,50,16,10],[106,52,16,10],[126,50,16,10],[146,52,16,10]],light:[[94,36,12,6],[122,32,12,6],[148,36,10,6]],tie:[]},
  side:{back:[],front:[...capS,...browS,[92,24,18,10],[112,20,18,10],[132,22,18,10],[152,24,16,10],[84,42,10,26],[86,58,18,14]],light:[[100,36,12,6],[130,32,12,6]],tie:[]},
  back:{back:[],front:[...capB,[86,24,16,10],[104,20,18,10],[124,22,18,10],[144,20,16,10],[86,92,84,10],[88,100,18,10],[110,102,18,10],[134,100,18,10]],light:[[96,58,16,6],[132,70,16,6]],tie:[]}},
 afro:{
  front:{back:[],front:[[100,12,56,6],[90,18,76,6],[82,24,92,6],[76,30,104,8],[72,38,112,20],[94,50,68,8],[72,52,24,40],[160,52,24,40],[76,92,16,12],[164,92,16,12]],light:[[92,26,24,6],[146,24,20,6]],tie:[]},
  side:{back:[],front:[[104,12,58,6],[94,18,80,6],[86,24,90,6],[80,30,98,8],[76,38,104,20],[100,50,64,8],[76,52,26,42],[80,94,18,12]],light:[[98,26,26,6],[144,24,18,6]],tie:[]},
  back:{back:[],front:[[100,12,56,6],[90,18,76,6],[82,24,92,6],[76,30,104,8],[72,38,112,56],[78,94,100,8],[88,102,80,8]],light:[[92,26,24,6],[146,24,20,6],[96,58,24,6]],tie:[]}},
 coils:{
  front:{back:[],front:[[102,16,52,6],[92,22,72,6],[84,28,88,6],[78,34,100,8],[74,42,108,18],[96,50,64,8],[74,54,22,38],[160,54,22,38],[78,92,16,10],[162,92,16,10]],light:[[92,30,10,6],[110,26,10,6],[130,30,10,6],[148,34,10,6],[96,50,10,6],[132,54,10,6],[86,66,10,6],[156,66,10,6]],tie:[]},
  side:{back:[],front:[[106,16,54,6],[96,22,76,6],[88,28,86,6],[82,34,94,8],[78,42,102,18],[102,50,60,8],[78,54,24,40],[82,94,16,10]],light:[[98,30,10,6],[118,26,10,6],[138,30,10,6],[102,52,10,6],[88,66,10,6]],tie:[]},
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
 pigtails:{
  front:{back:[[72,74,20,44],[68,114,22,28]],front:[...capF,...browF,[164,74,20,44],[164,114,22,28]],light:liteF,tie:[[72,68,20,8],[164,68,20,8]]},
  side:{back:[[74,78,22,46],[70,120,22,26]],front:[...capS,...browS,[86,58,14,26]],light:liteS,tie:[[76,72,22,8]]},
  back:{back:[],front:[...capB,[84,82,26,54],[80,132,28,26],[146,82,26,54],[148,132,28,26]],light:liteB,tie:[[84,76,26,8],[146,76,26,8]]}},
 'space-buns':{
  front:{back:[[92,16,30,24],[134,16,30,24]],front:[...capF,...browF],light:[[98,20,12,7],[140,20,12,7],...liteF],tie:[[96,38,22,7],[138,38,22,7]]},
  side:{back:[[86,16,32,24]],front:[...capS,...browS],light:[[92,20,14,7],...liteS],tie:[[90,38,24,7]]},
  back:{back:[],front:[...capB,[92,14,32,26],[132,14,32,26]],light:[[98,18,14,7],[138,18,14,7]],tie:[[94,38,26,7],[134,38,26,7]]}},
 mohawk:{
  // The shaved sides live in `light` so they read as stubble rather than a second band of hair.
  front:{back:[],front:[[114,4,28,10],[110,14,36,10],[112,24,32,32]],light:[[88,50,80,5],[120,10,14,8]],tie:[]},
  side:{back:[],front:[[98,16,16,16],[120,4,24,28],[150,14,18,18],[96,32,78,22]],light:[[92,54,80,5],[124,10,16,8]],tie:[]},
  back:{back:[],front:[[114,4,28,10],[110,14,36,10],[112,24,32,34]],light:[[88,50,80,5],[120,10,14,8]],tie:[]}},
 curtains:{
  // A centre parting: the cap stops short of the middle so skin shows between the two sweeps.
  front:{back:[[82,46,92,66]],front:[[102,30,52,6],[96,34,64,4],[92,38,72,4],[88,42,38,14],[130,42,38,14],[78,54,26,58],[152,54,26,58],[84,108,22,16],[150,108,22,16]],light:[[96,40,22,5],[140,40,20,5]],tie:[]},
  side:{back:[[88,46,50,70]],front:[...capS,[124,54,48,12],[86,54,16,58],[82,108,22,16]],light:liteS,tie:[]},
  back:{back:[],front:[...capB,[84,46,88,66],[80,108,22,16],[154,108,22,16]],light:liteB,tie:[]}},
 puff:{
  front:{back:[],front:[[112,0,32,6],[104,6,48,6],[98,12,60,6],[94,18,68,6],[92,24,72,10],...capF,...browF],light:[[106,8,18,6],[134,14,14,6]],tie:[]},
  side:{back:[],front:[[116,0,32,6],[108,6,48,6],[102,12,60,6],[98,18,68,6],[96,24,72,10],...capS,...browS],light:[[110,8,20,6],[138,14,12,6]],tie:[]},
  back:{back:[],front:[[112,0,32,6],[104,6,48,6],[98,12,60,6],[94,18,68,6],[92,24,72,10],...capB],light:[[106,8,18,6],[134,14,14,6]],tie:[]}},
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
