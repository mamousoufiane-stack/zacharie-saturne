export const ISLAND_SPACING=11;
export const JUMP_DURATION=1.05;
export const TOTAL_ISLANDS=36;
export const LANDING_DELAY=.22;
export const COLLAPSE_DEADLINE=.85;
export function islandDrop(age){return age==null?0:-.45*age-5*age*age;}
export class IslandJumper {
 constructor(){this.reset()}
 reset(){Object.assign(this,{distance:0,x:0,y:0,speed:0,lane:0,island:0,jumpTime:0,airborne:false,jumps:0,score:0,crystals:0,energy:100,recovery:0,perfect:0,elapsed:0,falls:0,landed:false,buffered:false,falling:false,failed:false,fallTime:0,launchY:0,lastGrade:'À TOI DE SAUTER',impacts:{}});}
 get groundAge(){return this.impacts[this.island]==null?null:this.elapsed-this.impacts[this.island];}
 jump(time=0){
  if(this.failed||this.falling||this.island>=TOTAL_ISLANDS||this.airborne)return false;
  if(this.groundAge!==null&&this.groundAge<LANDING_DELAY){this.lastGrade='ATTENDS LA RÉCEPTION !';return false;}
  if(this.groundAge!==null&&this.groundAge>=COLLAPSE_DEADLINE)return false;
  this.launchY=this.y;this.airborne=true;this.jumpTime=0;this.jumps=1;this.speed=ISLAND_SPACING/JUMP_DURATION;
  const phase=(time*2)%1;this.onBeat=Math.min(phase,1-phase)<.22;this.lastGrade=this.onBeat?'DANS LE TEMPO !':'BEAU SAUT !';return true;
 }
 update(dt){
  if(this.failed)return;
  this.elapsed+=dt;this.landed=false;
  if(this.falling){this.fallTime+=dt;this.y=this.fallStartY-3*this.fallTime-10*this.fallTime**2;if(this.fallTime>=1)this.failed=true;return;}
  if(!this.airborne){
   this.speed=0;this.y=islandDrop(this.groundAge);
   if(this.groundAge!==null&&this.groundAge>=COLLAPSE_DEADLINE){this.falling=true;this.fallStartY=this.y;this.falls++;this.lastGrade='TROP TARD !';}
   return;
  }
  this.jumpTime=Math.min(JUMP_DURATION,this.jumpTime+dt);const p=this.jumpTime/JUMP_DURATION;
  this.distance=(this.island+p)*ISLAND_SPACING;this.y=this.launchY*(1-p)**3+4*3.6*p*(1-p);
  if(p>=1){this.island++;this.distance=this.island*ISLAND_SPACING;this.y=0;this.airborne=false;this.jumps=0;this.speed=0;this.landed=true;this.crystals++;this.score+=this.onBeat?150:100;if(this.onBeat)this.perfect++;if(this.island<TOTAL_ISLANDS)this.impacts[this.island]=this.elapsed;}
 }
 seekToIsland(n){this.reset();this.island=Math.max(0,Math.min(TOTAL_ISLANDS,Math.floor(n)));this.distance=this.island*ISLAND_SPACING;}
}
