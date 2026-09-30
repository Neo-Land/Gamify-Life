import {describe,expect,it} from 'vitest';
import {resolveWallpaper,seasonScene,scenes,wallpaperIds} from '@/lib/wallpapers';
import {seasonIds} from '@/lib/themes';
describe('wallpapers',()=>{
 it('auto follows the chosen season: spring meadow, summer beach, fall hills, winter city',()=>{expect(seasonIds.map(s=>resolveWallpaper('auto',s))).toEqual(['fall','beach','city','meadow']);});
 it('an explicit wallpaper wins over the season',()=>{for(const s of seasonIds)expect(resolveWallpaper('city',s)).toBe('city');});
 it('every scene has a label and a CSS fallback',()=>{for(const id of wallpaperIds){expect(scenes[id].label).toBeTruthy();if(id!=='auto')expect(scenes[id].prev).toMatch(/^linear-gradient/);}expect(Object.values(seasonScene).sort()).toEqual(['beach','city','fall','meadow']);});
});
