import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {loadGeometry,readGLB} from './glb-helper.js';
import {jumpAnimation,HERO_CLIPS,HERO_MODEL_URL} from '../src/character.js';
import {JUMP_DURATION} from '../src/jumping.js';
const file='public/'+HERO_MODEL_URL.replace(/^\.\//,'').split('?')[0];
test('default Hunyuan hero contains skin, five named animations and embedded PBR textures',()=>{
 const {json}=readGLB(file);
 assert.deepEqual(json.animations.map(a=>a.name).sort(),[...HERO_CLIPS].sort());
 assert.equal(json.skins.length,1);
 assert.ok(json.images.every(i=>Number.isInteger(i.bufferView)&&!i.uri));
 assert.ok(json.materials.some(m=>m.pbrMetallicRoughness?.baseColorTexture));
 assert.ok(json.materials.some(m=>m.pbrMetallicRoughness?.metallicRoughnessTexture));
 for(const m of json.meshes)for(const p of m.primitives){assert.ok(p.attributes.JOINTS_0!==undefined);assert.ok(p.attributes.WEIGHTS_0!==undefined);}
});
test('jump animation follows the 1.05 second gameplay trajectory exactly',()=>{
 assert.equal(jumpAnimation(0).name,'JumpStart');
 assert.equal(jumpAnimation(.14).name,'JumpAir');
 assert.ok(Math.abs(jumpAnimation(JUMP_DURATION).time-.91)<1e-9);
 assert.deepEqual(jumpAnimation(100),jumpAnimation(JUMP_DURATION));
});
test('all exported poses stay finite, retain scale and have no root motion',async()=>{
 const {scene,animations}=await loadGeometry(file),mixer=new T.AnimationMixer(scene);
 for(const clip of animations){
  const action=mixer.clipAction(clip);mixer.stopAllAction();action.reset().play();action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;
  for(const t of [0,.25,.5,.75,.99]){
   mixer.setTime(clip.duration*t);scene.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(scene,true),size=bounds.getSize(new T.Vector3());
   assert.ok(Number.isFinite(size.length())&&size.y>2&&size.y<5,clip.name+' dimensions');
   assert.ok(size.x<5&&size.z<4,clip.name+' deformed bounds');
   const root=scene.getObjectByName('Root');assert.ok(root.position.length()<1e-6,clip.name+' root translation');
   if(clip.name!=='JumpAir')for(const side of ['L','R']){
    const foot=scene.getObjectByName('Foot'+side).getWorldPosition(new T.Vector3());
    assert.ok(Math.abs(foot.y-.23)<.005,clip.name+' planted foot height');
   }
   if(clip.name==='Victory')for(const side of ['L','R']){
    const hand=scene.getObjectByName('Hand'+side).getWorldPosition(new T.Vector3());
    const shoulder=scene.getObjectByName('UpperArm'+side).getWorldPosition(new T.Vector3());
    assert.ok(hand.y>shoulder.y+.4,'victory raises both hands');
   }
  }
 }
});
