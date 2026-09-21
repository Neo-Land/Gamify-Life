import {describe,expect,it} from 'vitest';
import {render} from '@testing-library/react';
import {initialState,stateSchema} from '../lib/domain';
import {applyCommand} from '../lib/progression';
import {randomTint} from '../lib/tints';
import {Avatar} from '../components/avatar';
describe('placeholder character tint',()=>{
 it('picks a tint deterministically from an injected rng',()=>{
  expect(randomTint(()=>0)).toBe('red');
  expect(randomTint(()=>0.999)).toBe('violet');
 });
 it('records a skip without minting any XP',()=>{
  const before=initialState();
  const r=applyCommand(before,{type:'profile',input:{characterCreated:true,characterSkipped:true,characterTint:'blue'}});
  expect(r.state.profile.characterTint).toBe('blue');
  expect(r.state.profile.characterSkipped).toBe(true);
  expect(r.xpAwarded).toBe(0);
  expect(r.state.ledger).toHaveLength(before.ledger.length);
 });
 it('dissolves the tint the moment a real cosmetic is chosen',()=>{
  let s=applyCommand(initialState(),{type:'profile',input:{characterSkipped:true,characterTint:'green'}}).state;
  s=applyCommand(s,{type:'avatar',slot:'top',itemId:'top-rose'}).state;
  expect(s.profile.characterTint).toBeNull();
  expect(s.profile.characterSkipped).toBe(false);
 });
 it('keeps the tint through an unrelated profile write',()=>{
  let s=applyCommand(initialState(),{type:'profile',input:{characterSkipped:true,characterTint:'orange'}}).state;
  s=applyCommand(s,{type:'profile',input:{name:'Ada'}}).state;
  expect(s.profile.characterTint).toBe('orange');
  expect(s.profile.characterSkipped).toBe(true);
 });
 it('round-trips through the schema and defaults on a legacy snapshot',()=>{
  const s=applyCommand(initialState(),{type:'profile',input:{characterTint:'violet'}}).state;
  expect(stateSchema.parse(JSON.parse(JSON.stringify(s))).profile.characterTint).toBe('violet');
  const legacy=JSON.parse(JSON.stringify(initialState())) as Record<string,unknown>;
  delete (legacy.profile as Record<string,unknown>).characterTint;
  delete (legacy.profile as Record<string,unknown>).characterSkipped;
  const parsed=stateSchema.parse(legacy);
  expect(parsed.profile.characterTint).toBeNull();
  expect(parsed.profile.characterSkipped).toBe(false);
 });
 it('tints the wardrobe onto one hue, leaves the face alone, and is inert when null',()=>{
  const s=initialState();
  const plain=render(<Avatar selection={s.avatar}/>).container;
  const untinted=render(<Avatar selection={s.avatar} tint={null}/>).container;
  // Each avatar gets its own clip id for the hair shadow; everything else must match exactly.
  const ids=(html:string)=>html.replace(/hair-shadow-[a-zA-Z0-9]+/g,"hair-shadow");
  expect(ids(untinted.innerHTML)).toBe(ids(plain.innerHTML));
  const tinted=render(<Avatar selection={s.avatar} tint="blue"/>).container;
  const fills=(root:Element,sel:string)=>[...root.querySelectorAll(`${sel} [fill]`)].map(e=>e.getAttribute('fill')!);
  // The eye line work keeps its authored values; tinting lashes, pupils or the sclera makes a smudge.
  // The blink lid follows the skin and the brows follow the hair, so both are expected to move.
  const lineWork=['#3a2f26','#241d18','#f8f4e8','#fffdf5','#4b3320'];
  const faceBefore=fills(plain,'[data-layer=face]'),faceAfter=fills(tinted,'[data-layer=face]');
  expect(faceAfter.length).toBe(faceBefore.length);
  faceBefore.forEach((f,i)=>{if(lineWork.includes(f))expect(faceAfter[i],`face fill ${i}`).toBe(f);});
  expect(lineWork.every(c=>faceAfter.includes(c))).toBe(true);
  // Everything the ramp covers moved onto the blue hue: blue is the dominant channel throughout.
  const rgb=(hex:string)=>{const n=parseInt(hex.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];};
  const changed=new Set<string>();
  for(const layer of ['body','head','top','bottoms','shoes','hair-front']){
   const before=fills(plain,`[data-layer=${layer}]`),after=fills(tinted,`[data-layer=${layer}]`);
   expect(after.length).toBe(before.length);
   after.forEach((f,i)=>{if(f!==before[i]&&f.startsWith('#'))changed.add(f);});
  }
  expect(changed.size).toBeGreaterThan(3);
  for(const f of changed){const [r,g,b]=rgb(f);expect(b>=r&&b>=g,`${f} is not on the blue ramp`).toBe(true);}
 });
});
