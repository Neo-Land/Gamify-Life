import {gear,type GearItem} from './content';
import type {State} from './domain';
/** Ready means every required item is owned or borrowable-in-hand. `borrowing` counts as having it —
 * that is the whole philosophy, not a concession. */
export const HAVE=['owned','borrowing'];
export function readiness(state:State,hobbyId:string){
 const required=(gear as GearItem[]).filter(g=>g.hobbyId===hobbyId&&g.necessity==='required');
 const missing=required.filter(g=>!HAVE.includes(state.gear[g.id]));
 return {ready:missing.length===0,missing,
  lowTotal:missing.reduce((a,g)=>a+g.cost.low,0),
  highTotal:missing.reduce((a,g)=>a+g.cost.high,0)};
}
