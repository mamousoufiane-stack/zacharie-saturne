import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export class Comets{
 constructor(scene){
  this.root=new T.Group();this.root.name='Cometes';scene.add(this.root);this.items=[];this.elapsed=0;
  this.ready=new GLTFLoader().loadAsync('./models/comet.glb').then(g=>{
   const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
   const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
   gradient.addColorStop(0,'rgba(235,252,255,1)');gradient.addColorStop(.12,'rgba(125,225,255,.85)');gradient.addColorStop(.4,'rgba(60,175,255,.22)');gradient.addColorStop(1,'rgba(30,100,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
   const texture=new T.CanvasTexture(canvas);
   for(let i=0;i<2;i++){
    const root=g.scene.clone(true);root.scale.setScalar(i?.75:1.1);root.rotation.z=.18;
    root.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.depthWrite=!o.material.transparent;if(o.material.transparent){o.material.opacity*=.35;o.material.side=T.FrontSide;}o.material.userData.opacity=o.material.opacity;}});
    const halo=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false,blending:T.AdditiveBlending,color:0x99ddff}));halo.scale.set(4,4,1);root.add(halo);
    const wisps=[];
    for(let n=0;n<16;n++){const t=n/15,sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false,blending:T.AdditiveBlending,color:0x6bbfff}));sprite.position.set(.5+t*12,Math.sin(t*5)*.15,-t*t*1.4);sprite.scale.set(3,1.8*(1-t)+.3,1);sprite.material.opacity=.22*(1-t);root.add(sprite);wisps.push({sprite,opacity:sprite.material.opacity});}
    this.root.add(root);this.items.push({root,halo,wisps,index:i});
   }
  }).catch(error=>console.warn('Chargement des comètes impossible',error));
 }
 update(dt,hero){
  this.elapsed+=dt;
  for(const {root,halo,wisps,index}of this.items){
   const p=(this.elapsed/(22+index*9)+index*.46)%1;
   root.position.set(hero.x+75-155*p,30-14*p+index*7,hero.z-80-index*40);
   const fade=Math.min(1,p*12,(1-p)*12);
   root.visible=fade>.01;halo.material.opacity=fade*.8;
   for(const w of wisps)w.sprite.material.opacity=w.opacity*fade;
   root.traverse(o=>{if(o.isMesh&&o.material.transparent)o.material.opacity=o.material.userData.opacity*fade;});
  }
 }
}
