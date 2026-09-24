/** Interface colourways. Each one redefines the `--os-*` palette in `app/retro.css`; nothing else
 * in the app knows they exist. `swatch` is what the picker shows: desktop, title bar, window. */
export const colorwayIds=['sage','blue','rose','pink','butter'] as const;
export type ColorwayId=typeof colorwayIds[number];
export const colorways:{id:ColorwayId;name:string;swatch:[string,string,string]}[]=[
 {id:'sage',name:'Sage terminal',swatch:['#87927A','#607263','#C9C8BE']},
 {id:'blue',name:'Pastel blue',swatch:['#8EA2B6','#566D83','#C6CAD0']},
 {id:'rose',name:'Pastel red',swatch:['#B98F8C','#845B58','#D2C6C4']},
 {id:'pink',name:'Pastel pink',swatch:['#BE93A8','#855C71','#D4C6CC']},
 {id:'butter',name:'Pastel yellow',swatch:['#BDAE78','#6E6540','#D3CDB8']}];
