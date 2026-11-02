import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {loadGeometry,readGLB} from './glb-helper.js';
test('three generated race asteroids contain textures and continuous running lanes',async()=>{
 for(const id of ['basalte','ambre','glace']){
  const path=`public/models/race/asteroid-${id}.glb`,{json}=readGLB(path);
  assert(json.images?.length);assert(json.materials?.[0]?.pbrMetallicRoughness?.baseColorTexture);
  const {scene}=await loadGeometry(path);scene.scale.z=128/120;scene.updateMatrixWorld(true);
  const ray=new T.Raycaster(),heights=[];
  // Broad central deck, plus both running lanes through the naturally tapered ends.
  for(const x of [-4,-3,-2,-1,0,1,2,3,4])for(let z=(Math.abs(x)<=2?-60:-45);z<=(Math.abs(x)<=2?60:45);z+=1){
   ray.set(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(scene,true)[0];
   assert(hit,`${id}: no running surface at x=${x},z=${z}`);assert(Math.abs(hit.point.y)<.75,`${id}: excessive relief at ${z}: ${hit.point.y}`);
   if(x===-2)heights.push(hit.point.y);
  }
  assert(Math.max(...heights)-Math.min(...heights)>.4,`${id}: top is still flat`);
  for(let i=1;i<heights.length;i++)assert(Math.abs(heights[i]-heights[i-1])<.25,`${id}: abrupt step on running lane`);
 }
});
test('finish line is a separately loaded model with gate and cloth flags',async()=>{
 const {scene}=await loadGeometry('public/models/race/finish-gate.glb');
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
 assert(meshes.length>=15);assert(meshes.some(m=>m.name.includes('ARRIV')));assert(meshes.some(m=>m.name.includes('Drapeau')));
});
test('corrected wolf is skinned, textured, and has actual locomotion',async()=>{
 const path='public/models/race/loup-coureur.glb',{json}=readGLB(path);assert(json.skins?.length);assert(json.images?.length);
 const g=await loadGeometry(path),run=g.animations.find(a=>a.name==='Run');assert(run);assert(run.tracks.length>10);
 const leg=g.scene.getObjectByName('FrontL'),q=leg.quaternion.clone(),mixer=new T.AnimationMixer(g.scene);mixer.clipAction(run).play();mixer.update(.15);assert(q.angleTo(leg.quaternion)>.1);
});
