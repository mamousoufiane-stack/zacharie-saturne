import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RaceWorld} from './race-world';
import {RACE_SEGMENTS,RACE_LENGTH} from './racing';

// The same runners, jump timing, camera and aura as the Saturn race.
export class MonsegurWorld extends RaceWorld {
 async load(){
  const loader=new GLTFLoader(),ids=['route','pont','falaise','arbre','drapeau','panneau'];
  const entries=await Promise.all(ids.map(async id=>[id,(await loader.loadAsync(`./models/monsegur/${id}.glb`)).scene]));
  this.templates=Object.fromEntries(entries);this.scenery=[];this.banks=[];this.trees=[];
  const put=(id,x,y,z,scale=1)=>{
   const mesh=this.templates[id].clone(true);mesh.position.set(x,y,z);mesh.scale.setScalar(scale);
   mesh.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return mesh;
  };
  // Extend the existing Hunyuan cliff into a mountainside. Keep the upper
  // ledge at its original scale, but carry its base below the visible valley.
  const terrain=this.templates.falaise.clone(true);terrain.updateMatrixWorld(true);
  const inverse=new T.Matrix4(),point=new T.Vector3();
  terrain.traverse(mesh=>{
   if(!mesh.isMesh)return;
   mesh.geometry=mesh.geometry.clone();inverse.copy(mesh.matrixWorld).invert();
   const positions=mesh.geometry.attributes.position;
   for(let i=0;i<positions.count;i++){
    point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
    if(point.y<-1){const depth=-point.y-1;point.y=-1-depth*30;point.x*=1+depth*.12;}
    point.applyMatrix4(inverse);positions.setXYZ(i,point.x,point.y,point.z);
   }
   mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
  });
  const mountain=(x,y,z,width,length)=>{
   const bank=terrain.clone(true);bank.position.set(x,y,z);bank.scale.set(width,1,length);
   bank.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=true;}});
   return bank;
  };
  // Overlapping banks form continuous land along both sides of the gorge.
  // Their wide outer slopes extend beyond the camera, rather than ending in midair.
  for(let z=-36;z<RACE_LENGTH+60;z+=24)for(const side of [-1,1]){
   const bank=mountain(side*29,-.22+.035*Math.sin(z*.071),-z,4,4.8);bank.name='Versant continu';
   this.root.add(bank);this.scenery.push(bank);this.banks.push(bank);
  }
  for(const s of RACE_SEGMENTS){
   const root=new T.Group();root.position.z=-(s.start+s.length/2);
   if(s.kind==='jump'){
    const rock=mountain(0,0,0,1,(s.length+2)/10);root.add(rock);
   }else{
    const id=s.model==='ambre'?'pont':'route';
    // Tile modules to preserve cobble and plank proportions over the long course.
    const count=Math.ceil((s.length+4)/28),length=(s.length+4)/count;
    for(let i=0;i<count;i++){
     const tile=put(id,0,0,(s.length+4)/2-length*(i+.5));tile.scale.z=(length+1.4)/28;root.add(tile);
     if(id==='route')root.add(mountain(0,-.3,(s.length+4)/2-length*(i+.5),1.15,(length+1.4)/10));
    }
    for(let z=s.start+10;z<s.end-8;z+=32){
     for(const side of [-1,1]){
      const tree=put('arbre',side*15,-.18,-z,1+(s.index%3)*.15);this.root.add(tree);this.scenery.push(tree);this.trees.push(tree);
     }
    }
    for(const side of [-1,1])root.add(put('drapeau',side*5.1,0,s.length/2-6));
    if(s.index%3===0)root.add(put('panneau',-5.3,0,s.length/2-14));
   }
   this.root.add(root);this.rocks.push({root,segment:s});
  }
  const gate=(await loader.loadAsync('./models/race/finish-gate.glb')).scene;
  gate.scale.x=.65;gate.position.set(0,.02,-(RACE_LENGTH-7));this.root.add(gate);this.finishGate=gate;
  const rival=await loader.loadAsync('./models/monsegur/bouquetin.glb');
  this.wolf=rival.scene;this.wolf.name='Bouquetin';this.root.add(this.wolf);
  this.wolfMixer=new T.AnimationMixer(this.wolf);this.wolfActions={};
  for(const clip of rival.animations)this.wolfActions[clip.name]=this.wolfMixer.clipAction(clip);
  this.wolfActions.Idle?.play();this.wolfLoaded=true;
  this.backdrop=await new T.TextureLoader().loadAsync('./images/monsegur-backdrop.png');this.backdrop.colorSpace=T.SRGBColorSpace;
  this.root.updateMatrixWorld(true);
  const groundRay=new T.Raycaster();
  for(const tree of this.trees){
   groundRay.set(new T.Vector3(tree.position.x,20,tree.position.z),new T.Vector3(0,-1,0));
   const hit=groundRay.intersectObjects(this.banks,true)[0];
   if(!hit)throw new Error('Un arbre de Montségur ne repose pas sur le terrain');
   tree.position.y=hit.point.y-.02;
  }
  this.sampleGround();
 }
 setActive(active){
  const wasActive=this.active;
  super.setActive(active);
  if(active&&!wasActive){
   this.savedBackground=this.world.backgroundTexture;this.savedFog=this.world.scene.fog;
   this.world.backgroundTexture=this.backdrop;this.world.scene.background=this.backdrop;this.world.fitBackground();
   this.world.scene.fog=new T.Fog('#b4cbd4',160,380);this.world.decor.visible=false;
   const comets=this.world.scene.getObjectByName('Cometes');if(comets){this.savedComets=comets.visible;comets.visible=false;}
   this.savedLights=[];
   for(const light of this.world.scene.children){
    if(light.isHemisphereLight||light.isDirectionalLight&&light!==this.world.sun){
     this.savedLights.push({light,color:light.color.clone(),ground:light.groundColor?.clone(),intensity:light.intensity});
     light.color.set(light.isHemisphereLight?'#c3e7ff':'#ffedd0');
     if(light.isHemisphereLight)light.groundColor.set('#657748');else light.intensity=.8;
    }
   }
  }else if(!active&&this.savedBackground){
   this.world.backgroundTexture=this.savedBackground;this.world.scene.background=this.savedBackground;this.world.fitBackground();
   this.world.scene.fog=this.savedFog;this.world.decor.visible=this.world.quality!=='low';this.savedBackground=null;
   for(const saved of this.savedLights){saved.light.color.copy(saved.color);saved.light.intensity=saved.intensity;if(saved.ground)saved.light.groundColor.copy(saved.ground);}
   const comets=this.world.scene.getObjectByName('Cometes');if(comets)comets.visible=this.savedComets;
  }
 }
 update(player,rival,dt,playing){
  super.update(player,rival,dt,playing);this.world.decor.visible=false;
  for(const item of this.scenery)item.visible=-item.position.z>player.distance-90&&-item.position.z<player.distance+360;
 }
}
