import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createFallbackHero} from './character-fallback.js';
import {JUMP_DURATION} from './jumping.js';

export const HERO_CLIPS = ['Idle', 'JumpStart', 'JumpAir', 'Land', 'Victory'];
export const TAKEOFF_DURATION = .14;
export function jumpAnimation(jumpTime) {
 const time = T.MathUtils.clamp(jumpTime, 0, JUMP_DURATION);
 return time < TAKEOFF_DURATION ? {name:'JumpStart',time} : {name:'JumpAir',time:time-TAKEOFF_DURATION};
}

export function createHero() {
 const fallback=createFallbackHero(),root=fallback.root;
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
  action.setLoop(['Idle','Victory'].includes(name)?T.LoopRepeat:T.LoopOnce,Infinity);
  action.clampWhenFinished=true;action.play();
  if(previous&&previous!==action){previous.fadeOut(.06);action.fadeIn(.06);}
  active=name;
 }
 hero.setSkin=(skin='original')=>new GLTFLoader().loadAsync(skin==='helmet'?'./models/zacharie-helmet.glb?v=gloves-fit-2':'./models/zacharie.glb').then(gltf=>{
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
  const bounds=new T.Box3().setFromObject(model,true),scale=2.65/(bounds.max.y-bounds.min.y);
  model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;
  root.remove(fallback.rig);root.add(model);hero.rig=model;mixer=new T.AnimationMixer(model);
  for(const clip of gltf.animations)actions[clip.name]=mixer.clipAction(clip);
  hero.status='ready';hero.skin=skin;play('Idle');mixer.update(0);root.updateMatrixWorld(true);hero.feetOffset=0;
 });
 hero.ready=hero.setSkin().catch(error=>{hero.status='fallback';hero.error=error;console.warn('Personnage de secours utilisé',error);});
 return hero;
}
