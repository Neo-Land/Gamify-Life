import {spriteItems} from './sprites';
/** Additional original styles. Existing IDs remain valid for saved characters. */
const colors=['#688b7b','#9b7784','#c6a16a','#536d87','#d5cbb7','#7d7596','#9b694e','#51797d','#859354','#b88d7d'];
const styles=(slot:string,names:string[],prefix=slot)=>names.map((name,i)=>({id:`${prefix}-${name.replaceAll(' ','-')}`,name,slot,color:colors[i%colors.length],level:0}));
export const extraWardrobe=[
 ...['porcelain','peach','golden','tan','mahogany','ebony'].map((name,i)=>({id:`skin-${name}`,name,slot:'body',color:['#f2dac4','#e7b899','#c99869','#ab704d','#774b3e','#44352e'][i],level:0})),
 ...styles('hair',['pixie','afro','locs','ponytail','bob','waves','undercut','twists']),
 ...['black','auburn','honey','ash','violet','teal'].map((name,i)=>({id:`color-${name}`,name,slot:'hairColor',color:['#242727','#894c38','#c9ac75','#88877d','#78627d','#426d68'][i],level:0})),
 ...styles('face',['neutral','happy','focused','curious','tired','victory','brows','moles','rosy']),
 ...styles('top',['striped tee','hoodie','button up','tank','long sleeve','polo','henley','sailor shirt']),
 ...styles('bottoms',['joggers','shorts','skirt','wide leg','athletic pants'], 'bottom'),
 ...styles('outerwear',['none','light jacket','cardigan','raincoat','varsity jacket','utility vest','denim jacket','towel cape','knit coat']),
 ...styles('shoes',['ankle boots','sandals','court shoes','cycling shoes','swim slides','high tops'],'shoe'),
 ...styles('headwear',['none','bucket hat','beanie','beret','sun hat','headband','bow','earmuffs','baseball cap','bandana','rain hood']),
 ...styles('faceAccessory',['none','round glasses','square glasses','sunglasses','reading glasses','sport glasses','monocle']),
 ...styles('backItem',['none','canvas backpack','messenger bag','tote','tool roll','notebook holster','frame pack','kickboard','ink satchel']),
 ...styles('accessory',['scarf','bandana','necklace','bow tie','wristbands','watch','earrings','flower pin','medal']),
 ...[{id:'prop-tennis-tube',name:'Ball tube',hobbyId:'tennis',level:1},{id:'prop-tennis-bag',name:'Racket bag',hobbyId:'tennis',level:3},{id:'prop-cycle-pump',name:'Mini pump',hobbyId:'cycling',level:1},{id:'prop-cycle-wheel',name:'Spoke companion',hobbyId:'cycling',level:3},{id:'prop-swim-board',name:'Kickboard',hobbyId:'swimming',level:1},{id:'prop-swim-towel',name:'Pool towel',hobbyId:'swimming',level:2},{id:'prop-page-aura',name:'Floating pages',hobbyId:'journaling',level:3}].map(i=>({...i,slot:'prop',color:'#a9b99a'}))
];
/** Hidden sprites exist only as art for earned cosmetics, so they are not equippable on their own. */
export const spriteWardrobe=spriteItems.filter(i=>!i.hidden).map(i=>({id:i.id,name:i.name,slot:i.slot,color:'#a9b99a',level:0,sprite:true as const}));
export const avatarSlots=[['body','Skin'],['hair','Hair'],['hairColor','Hair color'],['face','Face'],['top','Tops'],['bottoms','Bottoms'],['outerwear','Outerwear'],['shoes','Shoes'],['headwear','Headwear'],['faceAccessory','Face accessories'],['backItem','Bags'],['accessory','Accessories'],['prop','Hobby props']];
export const avatarAnchors={canvas:{width:256,height:384},baseline:364,head:{x:128,y:76},hand:{x:192,y:232},back:{x:168,y:180}};
