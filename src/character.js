import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createFallbackHero} from './character-fallback.js';
import {JUMP_DURATION} from './jumping.js';

export const HERO_CLIPS = ['Idle', 'JumpStart', 'JumpAir', 'Land', 'Victory'];
export const HERO_MODEL_URL = './models/zacharie-hunyuan.glb?v=8fb68f88';
export const HELMET_MODEL_URL = './models/zacharie-hunyuan-helmet.glb?v=80a784eb';
export const TAKEOFF_DURATION = .14;
export function jumpAnimation(jumpTime) {
 const time = T.MathUtils.clamp(jumpTime, 0, JUMP_DURATION);
 return time < TAKEOFF_DURATION ? {name:'JumpStart',time} : {name:'JumpAir',time:time-TAKEOFF_DURATION};
}

export function createHero() {
 const fallback=createFallbackHero(),root=fallback.root;
 // Keep the emergency model hidden while the actual character is loading.
 fallback.rig.visible=false;
 let model,mixer,active='',action,landTime=0,wasAirborne=false;
 const actions={};
 const hero={root,rig:fallback.rig,status:'loading',error:null,feetOffset:0,
  get mixer(){return mixer||fallback.mixer;},
  get animation(){return active;},
  animate(name){
   const clip={idle:'Idle',jump:'JumpAir',flight:'JumpAir',victory:'Victory'}[name]||name;
   if(!model){fallback.animate(name==='victory'?'victory':'idle');return;}
   play(clip);
  },
  update(dt,speed=0){if(!model){fallback.update(dt,speed);return;}mixer.update(dt);},
  updateForState(state,dt){
   if(!model){fallback.animate(state.airborne?'jump':'idle');fallback.update(dt,0);return;}
   if(state.race&&!state.airborne&&!state.falling&&state.speed>.3){
    play('Run');action.setEffectiveTimeScale(Math.max(.35,state.speed/16));mixer.update(dt);wasAirborne=false;landTime=0;return;
   }
   if(state.airborne){
    landTime=0;const sample=jumpAnimation(state.jumpTime);play(sample.name,true);
    action.time=Math.min(sample.time,action.getClip().duration);
   }else if(state.landed||wasAirborne){landTime=actions.Land.getClip().duration;play('Land');}
   else if(landTime>0){landTime=Math.max(0,landTime-dt);if(landTime===0)play('Idle');}
   else play('Idle');
   wasAirborne=state.airborne;mixer.update(dt);
  },
  reset(){landTime=0;wasAirborne=false;active='';play('Idle');}
 };
 function play(name,paused=false){
  if(!actions[name])return;
  if(active===name){action.paused=paused;return;}
  const previous=action;action=actions[name];action.reset();action.enabled=true;action.paused=paused;
  action.setEffectiveWeight(1);action.setEffectiveTimeScale(1);
  action.setLoop(['Idle','Victory','Run'].includes(name)?T.LoopRepeat:T.LoopOnce,Infinity);
  action.clampWhenFinished=true;action.play();
  if(previous&&previous!==action){previous.fadeOut(.06);action.fadeIn(.06);}
  active=name;
 }
 hero.setSkin=(skin='original')=>new GLTFLoader().loadAsync(skin==='helmet'?HELMET_MODEL_URL:HERO_MODEL_URL).then(gltf=>{
  const missing=HERO_CLIPS.filter(name=>!gltf.animations.some(c=>c.name===name));
  if(missing.length)throw new Error('Animations manquantes : '+missing.join(', '));
  if(model){
   root.remove(model);mixer.stopAllAction();mixer.uncacheRoot(model);
   model.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material])){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}}});
  }
  active='';action=null;for(const name of Object.keys(actions))delete actions[name];
  model=gltf.scene;model.name='Zacharie';model.rotation.y=Math.PI;
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
  model.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(model,true),scale=2.65/3.4;
  model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;
  root.remove(fallback.rig);root.add(model);hero.rig=model;mixer=new T.AnimationMixer(model);
  for(const clip of gltf.animations)actions[clip.name]=mixer.clipAction(clip);
  // A dedicated skeletal run cycle on the existing rig; original five clips stay unchanged.
  const tracks=[],times=Array.from({length:25},(_,i)=>i/30);
  for(const [name,amp,phase,bend] of [
   ['Thigh.L',.65,0,0],['Thigh.R',.65,Math.PI,0],['Shin.L',.6,1,-.25],['Shin.R',.6,Math.PI+1,-.25],
   ['UpperArm.L',.65,Math.PI,0],['UpperArm.R',.65,0,0],['Forearm.L',.1,0,-.8],['Forearm.R',.1,Math.PI,-.8]]){
   const bone=model.getObjectByName(name)||model.getObjectByName(name.replaceAll('.',''));if(!bone)continue;
   const values=[];for(let i=0;i<25;i++){const q=bone.quaternion.clone().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),bend+amp*Math.sin(i/24*Math.PI*2+phase)));values.push(q.x,q.y,q.z,q.w);}
   tracks.push(new T.QuaternionKeyframeTrack(bone.name+'.quaternion',times,values));
  }
  actions.Run=mixer.clipAction(new T.AnimationClip('Run',.8,tracks));
  hero.status='ready';hero.skin=skin;play('Idle');mixer.update(0);root.updateMatrixWorld(true);hero.feetOffset=0;
 });
 hero.ready=hero.setSkin().catch(error=>{fallback.rig.visible=true;hero.status='fallback';hero.error=error;console.warn('Personnage de secours utilisé',error);});
 return hero;
}
