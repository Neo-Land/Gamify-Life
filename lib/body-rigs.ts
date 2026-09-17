export const bodyRigIds=['short-slim','short-average','short-broad','average-slim','average-average','average-broad','tall-slim','tall-average','tall-broad'] as const;
export type BodyRigId=typeof bodyRigIds[number];
type Point={x:number;y:number};
export type PixelAnchorMap=Record<'head'|'face'|'neck'|'leftShoulder'|'rightShoulder'|'leftHand'|'rightHand'|'waist'|'back'|'leftFoot'|'rightFoot'|'ground',Point>;
export type BodyRig={id:BodyRigId;frameSize:{width:number;height:number};anchors:PixelAnchorMap;torso:string;sideTorso:string;headOffset:number;hip:number;sideHip:number;hem:number;supportedAnimations:readonly string[];hitRegions:readonly string[]};
// Each silhouette is authored on the same 128 × 192 grid. Faces and accessories
// retain their pixels; attachment uses translation, never body-width scaling.
const silhouettes:Record<BodyRigId,{headOffset:number;shoulder:[number,number,number];hand:[number,number,number];waist:number;hip:number;sideHip:number;torso:string;sideTorso:string}>={
 'short-slim':{headOffset:22,shoulder:[48,80,96],hand:[40,88,136],waist:138,hip:47,sideHip:53,torso:'M53 96h6v5h10v-5h6v4h5v38H48v-38h5z',sideTorso:'M57 96h12v5h7v37H53v-37h4z'},
 'short-average':{headOffset:22,shoulder:[42,86,96],hand:[34,94,136],waist:138,hip:43,sideHip:51,torso:'M49 96h10v5h10v-5h10v4h7v38H42v-38h7z',sideTorso:'M56 96h14v5h8v37H51v-37h5z'},
 'short-broad':{headOffset:22,shoulder:[36,92,96],hand:[28,100,136],waist:138,hip:39,sideHip:49,torso:'M44 96h15v5h10v-5h15v4h8v38H36v-38h8z',sideTorso:'M54 96h18v5h9v37H49v-37h5z'},
 'average-slim':{headOffset:0,shoulder:[48,80,74],hand:[40,88,126],waist:124,hip:47,sideHip:53,torso:'M53 74h6v5h10v-5h6v4h5v46H48V78h5z',sideTorso:'M57 74h12v5h7v45H53V79h4z'},
 'average-average':{headOffset:0,shoulder:[42,86,74],hand:[34,94,126],waist:124,hip:43,sideHip:51,torso:'M49 74h10v5h10v-5h10v4h7v46H42V78h7z',sideTorso:'M56 74h14v5h8v45H51V79h5z'},
 'average-broad':{headOffset:0,shoulder:[36,92,74],hand:[28,100,126],waist:126,hip:39,sideHip:49,torso:'M44 74h15v5h10v-5h15v4h8v48H36V78h8z',sideTorso:'M54 74h18v5h9v47H49V79h5z'},
 'tall-slim':{headOffset:-8,shoulder:[48,80,66],hand:[40,88,120],waist:116,hip:47,sideHip:53,torso:'M53 66h6v5h10v-5h6v4h5v46H48V70h5z',sideTorso:'M57 66h12v5h7v45H53V71h4z'},
 'tall-average':{headOffset:-8,shoulder:[42,86,66],hand:[34,94,120],waist:116,hip:43,sideHip:51,torso:'M49 66h10v5h10v-5h10v4h7v46H42V70h7z',sideTorso:'M56 66h14v5h8v45H51V71h5z'},
 'tall-broad':{headOffset:-8,shoulder:[36,92,66],hand:[28,100,120],waist:118,hip:39,sideHip:49,torso:'M44 66h15v5h10v-5h15v4h8v48H36V70h8z',sideTorso:'M54 66h18v5h9v47H49V71h5z'}
};
export const animationFrames={idle:[0,0,-1,-1,0,0],gesture:[0,-1,-2,-2,-1,0],celebration:[0,-1,-2,-3,-2,-1,0,-1,-2,0]} as const;
export const bodyRigs=Object.fromEntries(bodyRigIds.map(id=>{const r=silhouettes[id];return [id,{id,frameSize:{width:128,height:192},headOffset:r.headOffset,torso:r.torso,sideTorso:r.sideTorso,hip:r.hip,sideHip:r.sideHip,hem:r.waist,anchors:{head:{x:64,y:20+r.headOffset},face:{x:64,y:44+r.headOffset},neck:{x:64,y:70+r.headOffset},leftShoulder:{x:r.shoulder[0],y:r.shoulder[2]},rightShoulder:{x:r.shoulder[1],y:r.shoulder[2]},leftHand:{x:r.hand[0],y:r.hand[2]},rightHand:{x:r.hand[1],y:r.hand[2]},waist:{x:64,y:r.waist},back:{x:r.shoulder[1]+10,y:r.shoulder[2]+29},leftFoot:{x:r.hip+10,y:182},rightFoot:{x:118-r.hip,y:182},ground:{x:64,y:182}},supportedAnimations:['idle','gesture','celebration'],hitRegions:['body','face','hair','top','bottoms','shoes','outerwear','headwear','faceAccessory','accessory','backItem','prop']}];})) as unknown as Record<BodyRigId,BodyRig>;
