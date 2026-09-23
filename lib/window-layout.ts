/** Three windowed apps plus the desktop itself. Quests, gear and the skill map live inside a hobby;
 * achievements and appearance live inside the character. `legacyAppIds` are ids older saves may
 * still hold: their window state is dropped on load rather than failing the whole snapshot. */
export const appIds=['hobbies','character','settings'] as const;
export const legacyAppIds=['map','quests','loadout','achievements','calendar'] as const;
/** Where a retired route goes now. Deep links and bookmarks keep working. */
export const legacyRoutes:[RegExp,string][]=[[/^\/loadout\/appearance(\/.*)?$/,'/character/appearance$1'],[/^\/loadout$/,'/hobbies'],[/^\/quests$/,'/hobbies'],[/^\/achievements$/,'/character'],[/^\/calendar$/,'/home']];
export const redirectFor=(path:string)=>{for(const [from,to] of legacyRoutes)if(from.test(path))return path.replace(from,to).replace(/\$1$/,'');return null;};
export type AppId=typeof appIds[number];
export type Geometry={x:number;y:number;width:number;height:number};
export function clampWindow(g:Geometry,bounds:{width:number;height:number}):Geometry{const width=Math.min(Math.max(320,g.width),Math.max(0,bounds.width-16));const height=Math.min(Math.max(240,g.height),Math.max(0,bounds.height-16));return {width,height,x:Math.max(8,Math.min(g.x,bounds.width-width-8)),y:Math.max(8,Math.min(g.y,bounds.height-height-8))};}
