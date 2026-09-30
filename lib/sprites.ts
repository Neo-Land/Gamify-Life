/** Original pixel art, one letter per pixel, `.` transparent. Rendered to SVG (one path per colour)
 * so it works on the server, scales crisply at any integer size and needs no canvas. Frames are
 * written to `public/ui/*.svg` by `scripts/ui-frames.mts`; everything else renders inline. */
export const P:Record<string,string>={K:'#2c3833',W:'#ffffff',L:'#ededed',F:'#d6d6d6',S:'#9c9c9c',D:'#707070',k:'#151515',w:'#f4f4f4',y:'#f2c94a',o:'#9a6a12',g:'#b8d86a',G:'#6f8f2c',r:'#d8404e',R:'#b02030',b:'#1d3d72',s:'#c8d4e6',h:'#e0b040',p:'#e6a6c0',m:'#4a4a4a',l:'#d8d8d8',d:'#8e8e8e',e:'#e8b88a',n:'#8a5a2c',u:'#3a78d0',c:'#6ec6d8',v:'#9a70c8',t:'#3f8f7f',a:'#e08a3c',q:'#d8b080',1:'#c6ded4',2:'#abcbbe',3:'#93b9a9',4:'#7ea896',5:'#6c9784',6:'#5b8572'};
export const S={
 /* 9-slice frames */
 win:['.KKKKK.','KWWWWDK','KWLLSDK','KWLFSDK','KWSSSDK','KDDDDDK','.KKKKK.'],
 sunk:['DDDDW','DKKLW','DK.LW','DLLLW','WWWWW'],
 btn:['WWWWK','WLLSK','WLFSK','WSSSK','KKKKK'],
 btnp:['KKKKW','KSSLW','KSFLW','KLLLW','WWWWW'],
 /* hobbies */
 tennis:['....kkkk....','..kkggggkk..','.kgggggwwgk.','.kggggwggGk.','kgggggwgggGk','kggggwggggGk','kgggwwggggGk','kgwwgggggGGk','.kwggggggGk.','.kgggggGGGk.','..kkGGGGkk..','....kkkk....'],
 cycling:['............','..kk....kkk.','...r.....k..','...rrrrrrk..','..r.r...rk..','.kkkr..kkrk.','k..rkrrk.r.k','k.k.k..k.k.k','k...k..k...k','.kkk....kkk.','............','............'],
 swimming:['............','........kk..','.......keek.','.......keek.','....kk..kk..','...keek.....','..keeeekk...','............','uu..uu..uu..','uuuuuuuuuuuu','cuuccuuccuuc','cccccccccccc'],
 journaling:['..kkkkkkkk..','..kvvvvvvwk.','..kvvvvvvwk.','..kvwwwwvwk.','..kvvvvvvwk.','..kvwwwwvwk.','..kvvvvvvwk.','..kvvvvvvwk.','..kvvvvvvwk.','..kvvvvvvwk.','..kkkkkkkkk.','............'],
 'pc-building':['............','.kkkkkkkkkk.','.kssssssssk.','.ksuuuuuusk.','.ksuuuuuusk.','.ksuuuuuusk.','.kssssssssk.','.kkkkkkkkkk.','.....kk.....','...kkkkkk...','...kssssk...','...kkkkkk...'],
 drawing:['..........kk','.........krk','........kyyk','.......kyyk.','......kyyk..','.....kyyk...','....kyyk....','...kyyk.....','..keek......','..kek.......','..kk........','............'],
 painting:['............','...kkkkkk...','..kqqqqqqk..','.kqrqquqqqk.','.kqqqqqqyqk.','.kqgqqqqqqk.','.kqqqqkkqqk.','.kqqqk..kqk.','..kqqqk.kk..','...kqqqqk...','....kkkk....','............'],
 running:['............','............','....kkk.....','....kwwk....','....kwwwk...','...krwwwwk..','..krrrwwwwk.','.krrrrrrwwwk','.kwwwwwwwwwk','.kkkkkkkkkkk','............','............'],
 volleyball:['....kkkk....','..kkwwyykk..','.kwwwwyyyyk.','.kuwwwwyyyk.','kuuuwwwwyyyk','kuuuuwwwwwwk','kuuuuwwwwwwk','kwuuuwwyyyyk','.kwwuwyyyyk.','.kwwwwyyywk.','..kkwwwwkk..','....kkkk....'],
 reading:['............','............','.kkkk..kkkk.','kwwwwkkwwwwk','kwkkwkkwkkwk','kwwwwkkwwwwk','kwkkwkkwkkwk','kwwwwkkwwwwk','kwwwwkkwwwwk','.kkkkttkkkk.','.....tt.....','............'],
 /* apps */
 home:['............','.....kk.....','....kyyk....','...kyyyyk...','..kyyyyyyk..','.kkkkkkkkkk.','..kwwwwwwk..','..kwkkwwwk..','..kwkkwuuk..','..kwkkwuuk..','..kkkkkkkk..','............'],
 hobbies:['kkkkk..kkkkk','kyyyk..krrrk','kyyyk..krrrk','kyyyk..krrrk','kkkkk..kkkkk','............','............','kkkkk..kkkkk','kuuuk..kgggk','kuuuk..kgggk','kuuuk..kgggk','kkkkk..kkkkk'],
 character:['............','....kkkk....','...keeeek...','...keeeek...','...keeeek...','....kkkk....','..kkttttkk..','.kttttttttk.','.kttttttttk.','.kttttttttk.','.kkkkkkkkkk.','............'],
 settings:['............','.....kk.....','..k.kddk.k..','...kddddk...','..kddkkddk..','kkddk..kddkk','kkddk..kddkk','..kddkkddk..','...kddddk...','..k.kddk.k..','.....kk.....','............'],
 quests:['............','..kkkkkkkk..','.kwwwwwwwwk.','kwwwwwwwwwwk','kwkkkkkkkwwk','kwwwwwwwwwwk','kwkkkkkwwwwk','.kwwwwwwwwk.','..kkwkkkkk..','...kk.......','............','............'],
 calendar:['............','kkkkkkkkkkkk','krrrrrrrrrrk','krrrrrrrrrrk','kkkkkkkkkkkk','kwwkwwkwwwwk','kwwkwwkwwwwk','kkkkkkkkkkkk','kwwkwwkwwwwk','kwwkwwkwwrwk','kkkkkkkkkkkk','............'],
 /* chrome */
 book:['kkkkkkkkk.','kvvvvvvvk.','kvwwwwwvk.','kvvvvvvvk.','kvwwwwvvk.','kvvvvvvvk.','kvvvvvvvk.','kvvvvvvvk.','kwwwwwwwk.','kkkkkkkkk.'],
 open:['...kkkkkk.','.....kkkk.','....kkkkk.','...kkk.kk.','..kkk..kk.','.kkk......','kkk.......','kk........','..........','..........'],
 list:['..........','kk.kkkkkkk','kk.kkkkkkk','..........','kk.kkkkkkk','kk.kkkkkkk','..........','kk.kkkkkkk','kk.kkkkkkk','..........'],
 shield:['..kkkkkk..','.kGGGGGGk.','.kGGGGwGk.','.kGGGwwGk.','.kGwGwGGk.','.kGwwGGGk.','..kGwGGk..','..kGGGGk..','...kGGk...','....kk....'],
 download:['....kk....','....kk....','....kk....','.kk.kk.kk.','..kkkkkk..','...kkkk...','....kk....','..........','kkkkkkkkkk','kkkkkkkkkk'],
 pin:['...kkkk...','..krrrrk..','..krrrrk..','...krrk...','..kkkkkk..','....kk....','....kk....','....kk....','....k.....','..........'],
 close:['rrrrrrrrrr','rwwrrrrwwr','rrwwrrwwrr','rrrwwwwrrr','rrrrwwrrrr','rrrwwwwrrr','rrwwrrwwrr','rwwrrrrwwr','rrrrrrrrrr','kkkkkkkkkk'],
 minimize:['........','........','........','........','........','........','kkkkkk..','kkkkkk..'],
 maximize:['kkkkkkk.','kkkkkkk.','k.....k.','k.....k.','k.....k.','k.....k.','kkkkkkk.','........'],
 back:['...k....','..kk....','.kkkkkkk','kkkkkkkk','.kkkkkkk','..kk....','...k....','........'],
 next:['....k...','....kk..','kkkkkkk.','kkkkkkkk','kkkkkkk.','....kk..','....k...','........'],
 check:['..........','.........G','........GG','.......GG.','G.....GG..','GG...GG...','.GG.GG....','..GGG.....','...G......','..........'],
 lock:['...kkkk...','..k....k..','..k....k..','..k....k..','.kkkkkkkk.','.khhhhhhk.','.khhkkhhk.','.khhkkhhk.','.khhhhhhk.','.kkkkkkkk.'],
 star:['....kk....','...kyyk...','...kyyk...','kkkyyyykkk','kyyyyyyyyk','.kyyyyyyk.','..kyyyyk..','.kyyyyyyk.','.kyk..kyk.','.kk....kk.'],
 flame:['....k.....','...kak....','...kaak...','..kaaaak..','..kayaak..','.kaayyaak.','.kayyyyak.','.kayyyyak.','..kayyak..','...kkkk...'],
 tree:['....kk....','...kGGk...','..kGgGGk..','.kGGGgGGk.','.kGgGGGGk.','..kGGGgk..','...kkkk...','....kn....','....kn....','...kkkk...'],
 hourglass:['kkkkkkkkkk','.kwwwwwwk.','.kwyyyywk.','..kwyywk..','...kyyk...','...kwwk...','..kwyywk..','.kwyyyywk.','.kyyyyyyk.','kkkkkkkkkk'],
 tv:['............','..k.....k...','...k...k....','kkkkkkkkkkkk','kssssssssk.k','ksbbbbbbsksk','ksbbbbbbsk.k','ksbbbbbbsksk','kssssssssk.k','kkkkkkkkkkkk','.kk......kk.','............'],
 power:['............','.....bb.....','..b..bb..b..','.bb..bb..bb.','bb...bb...bb','bb...bb...bb','bb........bb','bb........bb','.bb......bb.','..bbbbbbbb..','............','............'],
 bang:['.kkkkkk.','kyykkyyk','kyykkyyk','kyykkyyk','kyyyyyyk','kyykkyyk','.kkkkkk.','kk......'],
 off:['..kkkk..','.kSSSSk.','kSllSSSk','kSlSSSSk','kSSSSSDk','kSSSSDDk','.kSDDDk.','..kkkk..'],
 warning:['....kk....','...kyyk...','...kyyk...','..kykkyk..','..kykkyk..','.kyykkyyk.','.kyyyyyyk.','kyyykkyyyk','kyyyyyyyyk','kkkkkkkkkk'],
} satisfies Record<string,string[]>;
export type SpriteName=keyof typeof S;
/** One `<path>` per colour; `scale` multiplies the coordinate grid for files that need a fixed pixel size. */
export function spritePaths(map:readonly string[],scale=1){const byColor:Record<string,string>={};map.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='.')byColor[ch]=(byColor[ch]||'')+`M${x*scale} ${y*scale}h${scale}v${scale}h${-scale}z`;}));return Object.entries(byColor).map(([ch,d])=>({fill:P[ch],d}));}
export function spriteSvg(map:readonly string[],scale=1){const w=map[0].length*scale,h=map.length*scale;return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${spritePaths(map,scale).map(p=>`<path fill="${p.fill}" d="${p.d}"/>`).join('')}</svg>`;}
