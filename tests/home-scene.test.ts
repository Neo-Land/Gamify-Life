import {describe,it,expect} from 'vitest';
import {constellationReducer,constellationLayout,intersects} from '../lib/home-scene';
it('keeps only one branch open and collapses without changing domain state',()=>{let s=constellationReducer({mode:'collapsed'},{type:'TOGGLE_CENTER'});expect(s.mode).toBe('hobbies');s=constellationReducer(s,{type:'SELECT_HOBBY',hobbyId:'tennis'});s=constellationReducer(s,{type:'SELECT_HOBBY',hobbyId:'swimming'});expect(s).toEqual({mode:'progress',hobbyId:'swimming'});expect(constellationReducer(s,{type:'VIEWPORT_CHANGED'})).toEqual(s);expect(constellationReducer(s,{type:'ESCAPE'})).toEqual({mode:'collapsed'});});
it('packs nodes outside the character and uses a strip when spatial placement is unsafe',()=>{for(const width of [320,768,1024,1280,1920]){const character={x:width/2-90,y:150,width:180,height:260};const layout=constellationLayout(width,700,character,4,3);if(layout.mode==='spatial')for(const [i,r]of layout.placements.entries()){expect(intersects(r,character)).toBe(false);expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width);for(const other of layout.placements.slice(i+1))expect(intersects(r,other)).toBe(false);}else expect(layout.placements).toHaveLength(0);}});

describe('constellation at ten hobbies',()=>{
 const character={x:620,y:300,width:200,height:300};
 it('either places every hobby without overlap or falls back to the scrollable strip',()=>{
  for(const [width,height] of [[1440,900],[1920,1080],[1280,720],[1024,768]]){
   const r=constellationLayout(width,height,character,10);
   if(r.mode==='strip'){expect(r.placements).toEqual([]);continue;}
   expect(r.placements).toHaveLength(10);
   for(let i=0;i<r.placements.length;i++)for(let j=i+1;j<r.placements.length;j++)
    expect(intersects(r.placements[i],r.placements[j]),`${width}x${height} nodes ${i}/${j} overlap`).toBe(false);
   for(const p of r.placements){
    expect(intersects(p,character,12),`${width}x${height} node over character`).toBe(false);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x+p.width).toBeLessThanOrEqual(width);
   }
  }
 });
 it('uses the strip on narrow viewports',()=>{
  expect(constellationLayout(390,844,character,10).mode).toBe('strip');
 });
});
