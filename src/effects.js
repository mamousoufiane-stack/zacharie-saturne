import * as T from 'three';
import {Comets} from './comets';
export class Effects{
 constructor(scene){this.scene=scene;this.particles=[];this.mesh=new T.InstancedMesh(new T.OctahedronGeometry(.055),new T.MeshBasicMaterial({color:'#ffe5a0'}),100);this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.mesh.frustumCulled=false;this.dummy=new T.Object3D();scene.add(this.mesh);this.comets=new Comets(scene)}
 burst(position,n=15){for(let i=0;i<n;i++)this.particles.push({p:position.clone(),v:new T.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5),life:1});this.particles=this.particles.slice(-100)}
 update(dt,hero,type,time,running){if(running&&Math.random()<.6){this.particles.push({p:hero.position.clone().add(new T.Vector3((Math.random()-.5)*.7,.2,.3)),v:new T.Vector3(0,.2,2),life:.65});this.particles=this.particles.slice(-100)}this.particles=this.particles.filter(p=>p.life>0);for(let i=0;i<100;i++){const p=this.particles[i];if(p){p.life-=dt;p.p.addScaledVector(p.v,dt);this.dummy.position.copy(p.p);this.dummy.scale.setScalar(Math.max(0,p.life)*1.5)}else this.dummy.scale.setScalar(0);this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix)}this.mesh.instanceMatrix.needsUpdate=true;this.comets.update(dt,hero.position);}
}

