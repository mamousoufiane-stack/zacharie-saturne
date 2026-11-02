import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {loadGeometry,readGLB} from './glb-helper.js';
import {RACE_SEGMENTS} from '../src/racing.js';

test('Montsegur modules have textured geometry and continuous two-lane running surfaces',async()=>{
 for(const id of ['route','pont','falaise']){
  const path=`public/models/monsegur/${id}.glb`,{json}=readGLB(path);
  assert(json.images?.length,`${id}: missing painted texture`);
  const {scene}=await loadGeometry(path);scene.updateMatrixWorld(true);
  const ray=new T.Raycaster(),end=id==='falaise'?3:12;
  for(const x of [-2,2]){
   let previous;
   for(let z=-end;z<=end;z+=.5){
    ray.set(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));
    const hit=ray.intersectObject(scene,true)[0];
    assert(hit,`${id}: missing ground ${x},${z}`);
    assert(Math.abs(hit.point.y)<.55,`${id}: ground level ${hit.point.y} at ${x},${z}`);
    if(previous!==undefined)assert(Math.abs(hit.point.y-previous)<.25,`${id}: abrupt ground change`);
    previous=hit.point.y;
   }
  }
 }
});
test('Montsegur module joints cover every metre of both race lanes',async()=>{
 const templates=Object.fromEntries(await Promise.all(['route','pont','falaise'].map(async id=>[id,(await loadGeometry(`public/models/monsegur/${id}.glb`)).scene])));
 const ray=new T.Raycaster();
 for(const s of RACE_SEGMENTS){
  const root=new T.Group();root.position.z=-(s.start+s.length/2);
  if(s.kind==='jump'){
   const rock=templates.falaise.clone(true);rock.scale.z=(s.length+2)/10;root.add(rock);
  }else{
   const count=Math.ceil((s.length+4)/28),length=(s.length+4)/count;
   for(let i=0;i<count;i++){
    const tile=templates[s.model==='ambre'?'pont':'route'].clone(true);
    tile.position.z=(s.length+4)/2-length*(i+.5);tile.scale.z=(length+1.4)/28;root.add(tile);
   }
  }
  root.updateMatrixWorld(true);
  for(const x of [-2,2])for(let d=Math.ceil(s.start);d<=s.end;d++){
   ray.set(new T.Vector3(x,20,-d),new T.Vector3(0,-1,0));
   const hit=ray.intersectObject(root,true)[0];assert(hit,`segment ${s.index}, lane ${x}, metre ${d}: hole`);
   assert(Math.abs(hit.point.y)<.55);
  }
 }
});
test('Bouquetin has embedded textures, a working skeleton and Idle/Run/Jump clips',async()=>{
 const path='public/models/monsegur/bouquetin.glb',{json}=readGLB(path);
 assert(json.skins?.length);assert(json.images?.length);
 const g=await loadGeometry(path);
 for(const name of ['Idle','Run','Jump'])assert(g.animations.some(c=>c.name===name));
 const leg=g.scene.getObjectByName('FrontL'),before=leg.quaternion.clone();
 const mixer=new T.AnimationMixer(g.scene);mixer.clipAction(g.animations.find(c=>c.name==='Run')).play();mixer.update(.15);
 assert(before.angleTo(leg.quaternion)>.1);
});
