export const seasonIds=['fall','summer','winter','spring'] as const;
export type SeasonalThemeId=typeof seasonIds[number];
export type AnimationIntensity='off'|'low'|'normal';
export type ThemeChoice={themeId:SeasonalThemeId;animationIntensity:AnimationIntensity};
/** A season: the desktop wallpaper it picks under Auto (lib/wallpapers), the character's lighting and the control accents. */
export type SeasonalTheme={id:SeasonalThemeId;name:string;characterLighting:{shadowColor:string;highlightColor:string}};
export const seasonalThemes:SeasonalTheme[]=seasonIds.map(id=>({id,name:({fall:'Autumn Hills',summer:'Summer Beach',winter:'City Nights',spring:'Spring Meadow'})[id],characterLighting:{shadowColor:({fall:'#65523a',summer:'#375e69',winter:'#63768e',spring:'#587148'})[id],highlightColor:({fall:'#f3cf9a',summer:'#ddedde',winter:'#dfeafa',spring:'#f4e2bf'})[id]}}));
export type ThemeControlAccents={buttonBorder:string;buttonHighlight:string;buttonPressed:string;focusRing:string;windowTitlePattern:string;cornerSprite:string};
export const themeControlAccents:Record<SeasonalThemeId,ThemeControlAccents>={
 fall:{buttonBorder:'#735037',buttonHighlight:'#d9b77a',buttonPressed:'#ead4b5',focusRing:'#664020',windowTitlePattern:'#bc9366',cornerSprite:'#b97845'},
 winter:{buttonBorder:'#4e6476',buttonHighlight:'#c5dce3',buttonPressed:'#c9d6dc',focusRing:'#254b6b',windowTitlePattern:'#b7ccd7',cornerSprite:'#83afbd'},
 spring:{buttonBorder:'#506c4d',buttonHighlight:'#ccdab8',buttonPressed:'#d3dec9',focusRing:'#32532b',windowTitlePattern:'#b8c7a5',cornerSprite:'#ba8594'},
 summer:{buttonBorder:'#456b71',buttonHighlight:'#e0cf94',buttonPressed:'#c8dcd9',focusRing:'#245663',windowTitlePattern:'#aac8c7',cornerSprite:'#c1a35c'}
};
