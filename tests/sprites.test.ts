import {describe,expect,it} from 'vitest';
import {P,S,spriteSvg} from '@/lib/sprites';
import {hobbies} from '@/lib/content';
describe('pixel sprites',()=>{
 it('every map is rectangular and uses only palette letters',()=>{for(const [name,map] of Object.entries(S)){for(const row of map){expect(row.length,name).toBe(map[0].length);for(const ch of row)if(ch!=='.')expect(P[ch],`${name} uses ${ch}`).toBeDefined();}}});
 it('every hobby has an icon',()=>{for(const h of hobbies)expect(S,h.id).toHaveProperty(h.id);});
 it('renders an svg at the scaled size',()=>{expect(spriteSvg(S.win,2)).toContain('width="14" height="14"');});
});
