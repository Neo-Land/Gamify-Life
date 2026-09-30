/** The wallpaper registry. Scenes are builders `(kit) => void` that draw into their layer and push
 * per-frame updaters; see components/scene-wallpaper.tsx for the Pixi app that runs them. */
import type {SeasonalThemeId} from '@/lib/themes';
import type {SurfStyle} from './surfboard';
export {meadow} from './meadow';
export {fall} from './fall';
export {city} from './city';
export {beach} from './beach';
import type {WallpaperChoice} from './ids';
export {wallpaperIds,type WallpaperChoice} from './ids';
export type SceneId=Exclude<WallpaperChoice,'auto'>;
/** `prev` doubles as the CSS fallback (no WebGL, reduced motion) and the Display Properties preview. */
export const scenes:Record<WallpaperChoice,{label:string;prev?:string}>={
 auto:{label:'Auto (match season)'},
 meadow:{label:'Spring Meadow',prev:'linear-gradient(#2f68cc,#9cc8f0 50%,#b9dcf6 56%,#6fae45 57%,#3e7426)'},
 fall:{label:'Autumn Hills',prev:'linear-gradient(#3d5fa8,#eaa56e 45%,#e0702a 56%,#b8742a 70%,#8a4a16)'},
 city:{label:'City Nights',prev:'linear-gradient(#120c34,#3a2470 35%,#a8487a 58%,#2e2050 60%,#120c20 85%,#0c0a14)'},
 beach:{label:'Summer Beach',prev:'linear-gradient(#2f7fd8,#d8f0f8 49%,#1d6fa0 50%,#5ad6d0 70%,#f4dca6 71%,#e2bc7a)'},
};
/** "Auto" follows the season the player already picked (profile.themeId), not the calendar. */
export const seasonScene:Record<SeasonalThemeId,SceneId>={spring:'meadow',summer:'beach',fall:'fall',winter:'city'};
export const resolveWallpaper=(choice:WallpaperChoice,season:SeasonalThemeId):SceneId=>choice==='auto'?seasonScene[season]:choice;
// sky = reflection on the deck, ground = bounce light on the rail, glow = hover light
export const surfStyles:Record<SceneId,SurfStyle>={
 meadow:{sky:'#5d9be6',ground:'#5e9a3c',glow:0x9fe07a},
 fall:{sky:'#eaa56e',ground:'#b8742a',glow:0xffb060},
 city:{sky:'#b04f9a',ground:'#2e2050',glow:0xff5aa0},
 beach:{sky:'#6fc0f0',ground:'#e8c890',glow:0x6fe0f0},
};
