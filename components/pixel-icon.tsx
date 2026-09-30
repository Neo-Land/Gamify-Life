import {PixelSprite} from './pixel-sprite';
/** Application icons: one per dock item (home, hobbies, character, settings) plus the calendar's
 * day markers. Art lives in `lib/sprites.ts`. */
export function PixelIcon({id}:{id:string}){return <PixelSprite name={({achievements:'star'} as Record<string,string>)[id]||id} className="pixel-icon"/>;}
