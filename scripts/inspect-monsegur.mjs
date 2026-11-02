import * as T from 'three';
import {loadGeometry} from '../tests/glb-helper.js';
const id=process.argv[2]||'pont';
const {scene}=await loadGeometry(`public/models/monsegur/${id}.glb`);scene.updateMatrixWorld(true);
const ray=new T.Raycaster(),rows=[];
for(const x of [-2,0,2])for(let z=-13;z<=13;z++){
 ray.set(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));
 const hits=ray.intersectObject(scene,true);rows.push({x,z,y:hits[0]?.point.y??null});
}
console.log(JSON.stringify({id,box:new T.Box3().setFromObject(scene),rows},null,2));
