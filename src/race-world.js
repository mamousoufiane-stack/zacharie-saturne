import * as T from 'three';
import {PowerAura} from './power-aura';
import {asteroidTemplates,buildAsteroid} from './asteroids';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RACE_SEGMENTS,RACE_LENGTH,MAX_SPEED} from './racing';
export class RaceWorld{
 constructor(world){
  this.world=world;this.root=new T.Group();this.root.visible=false;world.scene.add(this.root);
  this.rocks=[];this.ready=this.load();this.phase=0;
  this.aura=new PowerAura();world.scene.add(this.aura);
 }
 async load(){
  const loader=new GLTFLoader();
  const templates=await Promise.all(['basalte','ambre','glace'].map(id=>loader.loadAsync(`./models/race/asteroid-${id}.glb`)));
  const classic=asteroidTemplates((await loader.loadAsync('./models/andromeda/scene.gltf')).scene);
  for(const segment of RACE_SEGMENTS){
   let root;
   if(segment.kind==='jump'){
    root=new T.Group();
    for(const lane of [-2,2]){const rock=buildAsteroid(classic[(segment.sequence+segment.step)%3],segment.step);rock.position.x=lane;root.add(rock);}
   }else{
    root=templates[['basalte','ambre','glace'].indexOf(segment.model)].scene.clone(true);root.scale.set(1,1,(segment.length+8)/120);
   }
   root.position.z=-(segment.start+segment.length/2);
   root.traverse(o=>{if(o.isMesh){
    o.receiveShadow=true;o.castShadow=true;
    const material=o.material.clone();material.normalScale?.setScalar(1.1);material.aoMapIntensity=.8;
    // Reuse a continuous rock region of the original atlas, excluding UV padding.
    if(segment.kind!=='jump')material.onBeforeCompile=shader=>{
     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replaceAll('vMapUv','(fract(vMapUv) * .15 + vec2(.51,.69))'));
     shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',T.ShaderChunk.normal_fragment_maps.replaceAll('vNormalMapUv','(fract(vNormalMapUv) * .15 + vec2(.51,.69))'));
     shader.fragmentShader=shader.fragmentShader.replace('#include <aomap_fragment>',T.ShaderChunk.aomap_fragment.replaceAll('vAoMapUv','(fract(vAoMapUv) * .15 + vec2(.51,.69))'));
    };
    material.customProgramCacheKey=()=>segment.kind==='jump'?'classic-rock':'saturn-rock-atlas-region-v2';o.material=material;
   }});this.root.add(root);this.rocks.push({root,segment});
  }
  const gate=await loader.loadAsync('./models/race/finish-gate.glb');
  this.finishGate=gate.scene;this.finishGate.name='Arche arrivee';
  this.finishGate.scale.x=.65;this.finishGate.position.set(0,.025,-(RACE_LENGTH-7));
  this.finishGate.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});this.root.add(this.finishGate);
  const wolf=await loader.loadAsync('./models/race/loup-coureur.glb');this.wolf=wolf.scene;this.root.add(this.wolf);
  this.wolfMixer=new T.AnimationMixer(this.wolf);this.wolfActions={};for(const clip of wolf.animations)this.wolfActions[clip.name]=this.wolfMixer.clipAction(clip);
  this.wolfActions.Run?.play();this.wolfLoaded=true;
  this.sampleGround();
 }
 sampleGround(){
  this.root.updateMatrixWorld(true);this.heights=[[],[]];const ray=new T.Raycaster();
  for(const {root,segment:s} of this.rocks){
   for(let lane=0;lane<2;lane++)for(let d=Math.ceil(s.start);d<=Math.floor(s.end);d++){
    ray.set(new T.Vector3(lane?2:-2,20,-d),new T.Vector3(0,-1,0));
    const hit=ray.intersectObject(root,true)[0];
    if(!hit)throw new Error(`Surface manquante : rocher ${s.index}, voie ${lane}, metre ${d}`);
    this.heights[lane][d]=hit.point.y;
   }
  }
 }
 ground(d,lane=0){const a=this.heights?.[lane]?.[Math.floor(d)]??0,b=this.heights?.[lane]?.[Math.ceil(d)]??a;return T.MathUtils.lerp(a,b,d%1);}
 runnerGround(r,lane=0){return r.airborne?T.MathUtils.lerp(this.ground(r.jumpStart,lane),this.ground(r.jumpEnd,lane),Math.min(1,r.jumpTime/r.jumpDuration)):this.ground(r.distance,lane);}
 setActive(active){this.root.visible=active;this.active=active;this.aura.visible=false;for(const {root}of this.world.islands)root.visible=!active;this.world.targetMarker.visible=!active;this.world.camera.fov=50;this.world.camera.updateProjectionMatrix();}
 update(player,rival,dt,playing){
  const world=this.world,d=player.distance;this.phase+=playing?dt:0;
  world.hero.root.position.set(-2,this.runnerGround(player)+player.y+.02,-d);world.hero.root.rotation.set(0,0,0);world.hero.root.scale.setScalar(.9);
  if(playing)world.hero.updateForState(!player.airborne&&RACE_SEGMENTS[player.island]?.kind==='jump'?{...player,speed:0}:player,dt);
  if(this.wolf){
   this.wolf.position.set(2,this.runnerGround(rival,1)+rival.y+.035,-rival.distance);
   this.wolf.rotation.set(0,Math.PI,0);
   if(playing){
    const name=rival.airborne?'Jump':rival.speed>.3?'Run':'Idle';
    if(this.wolfClip!==name){for(const action of Object.values(this.wolfActions))action.stop();this.wolfActions[name]?.reset().play();this.wolfClip=name;}
    this.wolfActions.Run?.setEffectiveTimeScale(Math.max(.3,rival.speed/17));this.wolfMixer.update(dt);
   }
   this.wolf.rotation.x=rival.airborne?-.10:0;
  }
  const charge=player.speed/MAX_SPEED;
  this.aura.update(this.phase,charge,world.hero.root.position,!player.falling&&!player.finished);
  world.sun.position.set(12,35,-d-15);world.sun.target.position.set(0,0,-d-12);
  const anchor=d-T.MathUtils.clamp(d-rival.distance,-12,12)*.5;
  world.camera.position.lerp(new T.Vector3(0,8.5,-anchor+17),1-Math.exp(-dt*8));world.camera.lookAt(0,1,-d-12);
  world.camera.fov=T.MathUtils.lerp(world.camera.fov,50+charge*10,1-Math.exp(-dt*3));world.camera.updateProjectionMatrix();
  world.bloom.strength=.18+charge*.2;
  for(const {m,i}of world.assets){m.position.set((i%2?1:-1)*(16+i%7*5),-6+(i%8)*3,-d-((i*19)%430)+30);}
  for(const {root,segment:s}of this.rocks)root.visible=s.end>d-45&&s.start<d+350;
 }
}
