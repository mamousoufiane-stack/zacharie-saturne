import * as T from 'three';

// Native animated flame volume. The centre remains transparent so the runner stays readable.
const vertex=`
 uniform float time; uniform float strength; varying vec3 local; varying vec3 normalView; varying vec3 eye;
 void main(){
  vec3 p=position;float a=atan(p.z,p.x);float upper=smoothstep(-.6,.9,p.y);
  float flame=sin(a*9.+time*5.+p.y*4.)*.55+sin(a*15.-time*7.+p.y*8.)*.25;
  float lift=upper*(.12+strength*.22)*flame;
  p.xz*=1.+lift; p.y+=upper*(.12+strength*.15)*sin(a*11.-time*5.);
  local=p;vec4 mv=modelViewMatrix*vec4(p,1.);eye=-mv.xyz;normalView=normalize(normalMatrix*normal);
  gl_Position=projectionMatrix*mv;
 }`;
const fragment=`
 uniform float time; uniform float strength; uniform float opacity; varying vec3 local; varying vec3 normalView; varying vec3 eye;
 float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 void main(){
  float rim=pow(1.-abs(dot(normalize(normalView),normalize(eye))),1.5);
  float flow=noise(local*vec3(5.,3.,5.)-vec3(0.,time*4.,0.));
  float detail=noise(local*10.-vec3(0.,time*7.,0.));
  float fire=smoothstep(.25,.8,flow*.7+detail*.3);
  float fade=smoothstep(-1.,-.7,local.y)*(1.-smoothstep(.78,1.2,local.y));
  float alpha=(rim*(.28+fire*.6)+fire*.045)*fade*opacity*strength;
  vec3 color=mix(vec3(1.,.22,.015),vec3(1.,.83,.18),fire*.65+rim*.35);
  color=mix(color,vec3(1.,.97,.64),pow(fire,3.)*.7);
  gl_FragColor=vec4(color*1.6,alpha);
 }`;

export class PowerAura extends T.Group{
 constructor(){
  super();this.name='Aura solaire';this.visible=false;this.flames=[];
  const geometry=new T.SphereGeometry(1,48,40);
  for(let i=0;i<2;i++){
   const material=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{time:{value:0},strength:{value:0},opacity:{value:i?.35:.62}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.FrontSide});
   const flame=new T.Mesh(geometry,material);flame.scale.set(1.05+i*.24,1.8+i*.3,.95+i*.2);flame.position.y=1.55;this.add(flame);this.flames.push(flame);
  }
  this.sparkGeometry=new T.BufferGeometry();this.sparkGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(90*3),3));
  const sparkMaterial=new T.ShaderMaterial({uniforms:{strength:{value:0}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
   vertexShader:`uniform float strength;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp((35.+strength*35.)/-p.z,1.,9.);gl_Position=projectionMatrix*p;}`,
   fragmentShader:`uniform float strength;void main(){float r=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-r),2.);gl_FragColor=vec4(1.,.82,.27,a*strength);}`});
  this.sparks=new T.Points(this.sparkGeometry,sparkMaterial);this.sparks.frustumCulled=false;this.add(this.sparks);
  this.light=new T.PointLight('#ffba43',0,7,2);this.light.position.y=1.3;this.add(this.light);
 }
 update(time,charge,position,enabled){
  const power=T.MathUtils.smoothstep(charge,.18,1);
  this.visible=enabled&&power>.01;this.position.copy(position);
  for(let i=0;i<this.flames.length;i++){const m=this.flames[i].material;m.uniforms.time.value=time+i*1.7;m.uniforms.strength.value=power;this.flames[i].rotation.y=i*.9+Math.sin(time*.7)*.12;}
  this.light.intensity=power*2.5;this.sparks.material.uniforms.strength.value=power;
  const attr=this.sparkGeometry.attributes.position;
  for(let i=0;i<90;i++){
   const life=(time*(.45+charge*.55)+i*.618)%1,a=i*2.39996,r=(.65+(i%7)*.07)*(1-life*.3);
   attr.setXYZ(i,Math.cos(a)*r,life*4.6,Math.sin(a)*r+life*charge*.9);
  }
  attr.needsUpdate=true;
 }
}
