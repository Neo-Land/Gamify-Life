/** Placeholder colours for a character the player skipped designing. An authored enum rather than a
 * free hex string: it round-trips through Supabase as a known token and can never put an arbitrary
 * value into an SVG fill attribute. */
export const tints={red:'#C4514B',orange:'#D1793A',yellow:'#C9A93F',green:'#5F8F5B',blue:'#4B7BA8',indigo:'#5B5A94',violet:'#8A5F96'} as const;
export type TintId=keyof typeof tints;
export const tintIds=Object.keys(tints) as [TintId,...TintId[]];
/** Takes an injectable rng so the reducer test can assert deterministically. */
export const randomTint=(rng:()=>number=Math.random):TintId=>tintIds[Math.floor(rng()*tintIds.length)%tintIds.length];
