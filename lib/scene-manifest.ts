import {bodyRigIds,bodyRigs,animationFrames} from './body-rigs';
import {avatarItems,hobbies} from './content';
import {seasonalThemes,themeControlAccents} from './themes';
import {seasonScene} from './wallpapers';
/** These assets are native SVG renderers, not externally sourced sprite sheets.
 * Clothing uses authored rig geometry with fixed-size pixel details. */
export const sceneAssetManifest={
 bodyRigs,animations:animationFrames,
 avatarItems:Object.fromEntries(avatarItems.map(item=>[item.id,bodyRigIds.map(bodyRigId=>({bodyRigId,renderer:'components/rig-layers.tsx',frameSize:{width:256,height:384},animations:['idle','gesture','celebration']}))])),
 themes:Object.fromEntries(seasonalThemes.map(t=>[t.id,{renderer:'components/scene-wallpaper.tsx',scene:seasonScene[t.id],builder:`lib/wallpapers/${seasonScene[t.id]}.ts`,layers:['sky','celestial','distant','ground','perspective','midground','scatter','foreground','ambient'],compositions:['portrait','landscape'],previewAssets:[] as string[],controls:themeControlAccents[t.id]}])),
 hobbyIcons:Object.fromEntries(hobbies.map(h=>[h.id,h.icon]))
};
