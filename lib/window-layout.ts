export const appIds=['hobbies','map','quests','character','loadout','achievements','calendar','settings'] as const;
export type AppId=typeof appIds[number];
export type Geometry={x:number;y:number;width:number;height:number};
export function clampWindow(g:Geometry,bounds:{width:number;height:number}):Geometry{const width=Math.min(Math.max(320,g.width),Math.max(0,bounds.width-16));const height=Math.min(Math.max(240,g.height),Math.max(0,bounds.height-16));return {width,height,x:Math.max(8,Math.min(g.x,bounds.width-width-8)),y:Math.max(8,Math.min(g.y,bounds.height-height-8))};}
