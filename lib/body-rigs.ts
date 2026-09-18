export const bodyRigIds=['short-slim','short-average','short-broad','average-slim','average-average','average-broad','tall-slim','tall-average','tall-broad'] as const;
export type BodyRigId=typeof bodyRigIds[number];
type Point={x:number;y:number};
export type PixelAnchorMap=Record<'head'|'face'|'neck'|'leftShoulder'|'rightShoulder'|'leftHand'|'rightHand'|'waist'|'back'|'leftFoot'|'rightFoot'|'ground',Point>;
export type BodyRig={id:BodyRigId;frameSize:{width:number;height:number};anchors:PixelAnchorMap;torso:string;sideTorso:string;headOffset:number;hip:number;sideHip:number;hem:number;supportedAnimations:readonly string[];hitRegions:readonly string[]};
// Each silhouette is authored on the same 256 × 384 grid. Faces and accessories
// retain their pixels; attachment uses translation, never body-width scaling.
const silhouettes:Record<BodyRigId,{headOffset:number;shoulder:[number,number,number];hand:[number,number,number];waist:number;hip:number;sideHip:number;torso:string;sideTorso:string}>={
 'short-slim':{headOffset:44,shoulder:[96,160,192],hand:[80,176,272],waist:276,hip:94,sideHip:106,torso:'M106 192h12v10h20v-10h12v8h10v76H96v-76h10z',sideTorso:'M114 192h24v10h14v74H106v-74h8z'},
 'short-average':{headOffset:44,shoulder:[84,172,192],hand:[68,188,272],waist:276,hip:86,sideHip:102,torso:'M98 192h20v10h20v-10h20v8h14v76H84v-76h14z',sideTorso:'M112 192h28v10h16v74H102v-74h10z'},
 'short-broad':{headOffset:44,shoulder:[72,184,192],hand:[56,200,272],waist:276,hip:78,sideHip:98,torso:'M88 192h30v10h20v-10h30v8h16v76H72v-76h16z',sideTorso:'M108 192h36v10h18v74H98v-74h10z'},
 'average-slim':{headOffset:0,shoulder:[96,160,148],hand:[80,176,252],waist:248,hip:94,sideHip:106,torso:'M106 148h12v10h20v-10h12v8h10v92H96V156h10z',sideTorso:'M114 148h24v10h14v90H106V158h8z'},
 'average-average':{headOffset:0,shoulder:[84,172,148],hand:[68,188,252],waist:248,hip:86,sideHip:102,torso:'M98 148h20v10h20v-10h20v8h14v92H84V156h14z',sideTorso:'M112 148h28v10h16v90H102V158h10z'},
 'average-broad':{headOffset:0,shoulder:[72,184,148],hand:[56,200,252],waist:252,hip:78,sideHip:98,torso:'M88 148h30v10h20v-10h30v8h16v96H72V156h16z',sideTorso:'M108 148h36v10h18v94H98V158h10z'},
 'tall-slim':{headOffset:-16,shoulder:[96,160,132],hand:[80,176,240],waist:232,hip:94,sideHip:106,torso:'M106 132h12v10h20v-10h12v8h10v92H96V140h10z',sideTorso:'M114 132h24v10h14v90H106V142h8z'},
 'tall-average':{headOffset:-16,shoulder:[84,172,132],hand:[68,188,240],waist:232,hip:86,sideHip:102,torso:'M98 132h20v10h20v-10h20v8h14v92H84V140h14z',sideTorso:'M112 132h28v10h16v90H102V142h10z'},
 'tall-broad':{headOffset:-16,shoulder:[72,184,132],hand:[56,200,240],waist:236,hip:78,sideHip:98,torso:'M88 132h30v10h20v-10h30v8h16v96H72V140h16z',sideTorso:'M108 132h36v10h18v94H98V142h10z'}
};
export const animationFrames={idle:[0,0,-1,-1,0,0],gesture:[0,-1,-2,-2,-1,0],celebration:[0,-1,-2,-3,-2,-1,0,-1,-2,0]} as const;
export const bodyRigs=Object.fromEntries(bodyRigIds.map(id=>{const r=silhouettes[id];return [id,{id,frameSize:{width:256,height:384},headOffset:r.headOffset,torso:r.torso,sideTorso:r.sideTorso,hip:r.hip,sideHip:r.sideHip,hem:r.waist,anchors:{head:{x:128,y:40+r.headOffset},face:{x:128,y:88+r.headOffset},neck:{x:128,y:140+r.headOffset},leftShoulder:{x:r.shoulder[0],y:r.shoulder[2]},rightShoulder:{x:r.shoulder[1],y:r.shoulder[2]},leftHand:{x:r.hand[0],y:r.hand[2]},rightHand:{x:r.hand[1],y:r.hand[2]},waist:{x:128,y:r.waist},back:{x:r.shoulder[1]+20,y:r.shoulder[2]+58},leftFoot:{x:r.hip+20,y:364},rightFoot:{x:236-r.hip,y:364},ground:{x:128,y:364}},supportedAnimations:['idle','gesture','celebration'],hitRegions:['body','face','hair','top','bottoms','shoes','outerwear','headwear','faceAccessory','accessory','backItem','prop']}];})) as unknown as Record<BodyRigId,BodyRig>;
