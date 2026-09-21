import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {sceneAssetManifest as m} from '../lib/scene-manifest';
import {bodyRigIds} from '../lib/body-rigs';
import {avatarItems,hobbies} from '../lib/content';
const anchors=['head','face','neck','leftShoulder','rightShoulder','leftHand','rightHand','waist','back','leftFoot','rightFoot','ground'];
assert.equal(Object.keys(m.bodyRigs).length,9);
for(const id of bodyRigIds){const rig=m.bodyRigs[id];assert.deepEqual(rig.frameSize,{width:256,height:384});for(const anchor of anchors){const p=rig.anchors[anchor as keyof typeof rig.anchors];assert(p&&Number.isInteger(p.x)&&Number.isInteger(p.y),`${id}: missing pixel anchor ${anchor}`);assert(p.x>=0&&p.x<=256&&p.y>=0&&p.y<=384);}assert(rig.torso&&rig.sideTorso);}
for(const [name,frames]of Object.entries(m.animations))assert(frames.length>=(name==='celebration'?8:6)&&frames.length<=(name==='celebration'?12:8),`${name}: invalid frame count`);
for(const item of avatarItems){const variants=m.avatarItems[item.id];assert.equal(variants.length,9,`${item.id}: incomplete body support`);for(const v of variants){assert(existsSync(v.renderer));assert.deepEqual(v.frameSize,{width:256,height:384});assert(m.bodyRigs[v.bodyRigId]);}}
for(const [id,t]of Object.entries(m.themes)){assert(existsSync(t.renderer));for(const layer of ['sky','distant','perspective','midground','ground','foreground','ambient'])assert(t.layers.includes(layer),`${id}: missing ${layer}`);assert.deepEqual(t.compositions,['portrait','landscape']);for(const path of t.previewAssets)assert(existsSync(`public${path}`),`Missing ${path}`);for(const key of ['buttonBorder','buttonHighlight','buttonPressed','focusRing','windowTitlePattern','cornerSprite'])assert(t.controls[key as keyof typeof t.controls]);}
for(const hobby of hobbies)assert(m.hobbyIcons[hobby.id],`${hobby.id}: missing icon`);
console.log(`Scene manifest valid: 9 rigs, ${avatarItems.length} wardrobe items, 4 themes, ${Object.keys(m.hobbyIcons).length} hobby icons.`);
