import {describe,it,expect} from 'vitest';
import {constellationReducer,constellationLayout,intersects,pathButtonPlacement} from '../lib/home-scene';
import {boardLength} from '../lib/wallpapers/surfboard';
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
it('keeps YOUR PATH off the surfboard deck and on screen',()=>{
 for(const [width,phone] of [[320,true],[375,true],[768,true],[1024,false],[1280,false],[1920,false]] as const)for(const at of [.32,.5,.68]){
  const L=boardLength(width),x=width*at,deck={x:x-L/2,y:400-L*.1,width:L,height:L*.2},{at:side,rect}=pathButtonPlacement(width,x,400,L,phone);
  expect(intersects(rect,deck),`${width} @${at} ${side}`).toBe(false);expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.x+rect.width).toBeLessThanOrEqual(width);
  expect(side).toBe(phone?'under':at>.5?'tail':'nose');}
 const hub={x:900,y:380,width:140,height:48};expect(constellationLayout(1280,800,{x:560,y:150,width:160,height:240},0,0,hub).center).toEqual({x:970,y:404});
});
