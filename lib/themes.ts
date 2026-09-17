export const seasonIds=['fall','summer','winter','spring'] as const;
export type SeasonalThemeId=typeof seasonIds[number];
export type AnimationIntensity='off'|'low'|'normal';
export type ThemeChoice={themeId:SeasonalThemeId;animationIntensity:AnimationIntensity};
export type SeasonalTheme={id:SeasonalThemeId;name:string;palette:Record<string,string>;backgroundLayers:string[];animationLayers:{kind:string;normal:number;low:number};characterLighting:{shadowColor:string;highlightColor:string}};
export const seasonalThemes:SeasonalTheme[]=seasonIds.map(id=>({id,name:({fall:'Amber woodland',summer:'Mountain lake',winter:'Snowlight city',spring:'Blossom meadow'})[id],palette:{sky:({fall:'#e8b28e',summer:'#99c5cf',winter:'#a9b4cc',spring:'#c1d5cc'})[id]},backgroundLayers:['sky','landscape','foreground'].map(layer=>`/themes/${id}-${layer}.svg`),animationLayers:{kind:({fall:'leaf',summer:'shimmer',winter:'snow',spring:'bee'})[id],normal:id==='winter'?24:id==='fall'?16:10,low:id==='winter'?8:4},characterLighting:{shadowColor:({fall:'#65523a',summer:'#375e69',winter:'#63768e',spring:'#587148'})[id],highlightColor:({fall:'#f3cf9a',summer:'#ddedde',winter:'#dfeafa',spring:'#f4e2bf'})[id]}}));
