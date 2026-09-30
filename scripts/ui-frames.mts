/** Writes the 9-slice frame images used by `app/reskin.css`. Re-run after editing a frame in `lib/sprites.ts`. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {S,spriteSvg} from '../lib/sprites';
mkdirSync('public/ui',{recursive:true});
for(const k of ['win','sunk','btn','btnp'] as const)writeFileSync(`public/ui/${k}.svg`,spriteSvg(S[k],2));
