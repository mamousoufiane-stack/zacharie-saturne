export const RACE_SEGMENTS=[];
let cursor=0;
function addSegment(length,gap,model,kind='run',sequence=0,step=0){
 RACE_SEGMENTS.push({index:RACE_SEGMENTS.length,start:cursor,end:cursor+length,length,model,kind,sequence,step});
 cursor+=length+gap;
}
for(let i=0;i<9;i++){
 const length=[112,132,152][i%3],gap=[16,18,20][i%3];
 addSegment(length,gap,['basalte','ambre','glace'][i%3]);
 // Two small stepping stones make three jumps from one running section to the next.
 if(i===2||i===5){const sequence=i===2?1:2;addSegment(4,12,'classic','jump',sequence,1);addSegment(4,12,'classic','jump',sequence,2);}
}
export const RACE_LENGTH=RACE_SEGMENTS.at(-1).end;
export const MAX_SPEED=28;
export function segmentAt(d){return RACE_SEGMENTS.find(s=>d>=s.start&&d<=s.end);}
export class RaceRunner{
 constructor(){this.reset();}
 reset(){Object.assign(this,{race:true,distance:7,speed:0,y:0,elapsed:0,airborne:false,jumpTime:0,landed:false,
  taps:[],energy:0,cadence:0,finished:false,finishTime:null,falling:false,fallTime:0,falls:0,
  recovery:0,checkpoint:7,island:0,score:0,crystals:0,perfect:0,lastGrade:'TAPOTE X POUR COURIR'});}
 tap(){if(this.finished||this.falling)return false;this.taps.push(this.elapsed);this.speed=Math.min(this.maxSpeed??MAX_SPEED,this.speed+1.8);return true;}
 jump(){
  if(this.airborne||this.falling||this.finished)return false;
  const s=segmentAt(this.distance);if(!s)return false;
  const next=RACE_SEGMENTS[s.index+1],remaining=s.end-this.distance;
  this.jumpStart=this.distance;this.jumpTime=0;this.jumpSpeed=Math.max(6,this.speed);
  this.jumpDuration=1.05;
  if(next&&(s.kind==='jump'||remaining<=Math.max(12,this.speed*.55)&&this.speed>=8)){
   this.jumpEnd=next.start+(next.kind==='jump'?next.length/2:6);this.jumpDuration=s.kind==='jump'?1.05:Math.max(1,Math.min(1.5,(this.jumpEnd-this.distance)/this.jumpSpeed));
  }else this.jumpEnd=this.distance+this.jumpSpeed*this.jumpDuration;
  this.airborne=true;return true;
 }
 update(dt){
  if(this.finished)return;
  this.elapsed+=dt;this.landed=false;
  if(this.falling){
   this.fallTime+=dt;this.y=-4*this.fallTime-8*this.fallTime**2;this.speed=0;
   if(this.fallTime>=1.5){this.falling=false;this.distance=this.checkpoint;this.y=0;this.taps=[];this.energy=0;this.lastGrade='REPARTS AVEC X !';}
   return;
  }
  this.taps=this.taps.filter(t=>this.elapsed-t<1.2);
  this.cadence=this.taps.length/1.2;
  const target=Math.min(this.maxSpeed??MAX_SPEED,this.cadence*5.2);
  this.speed+=(target-this.speed)*(1-Math.exp(-dt*2.2));
  if(this.speed<.06)this.speed=0;
  this.energy=this.speed/MAX_SPEED*100;
  if(this.airborne){
   this.jumpTime+=dt;const p=Math.min(1,this.jumpTime/this.jumpDuration);
   this.distance=this.jumpStart+(this.jumpEnd-this.jumpStart)*p;this.y=4*4.2*p*(1-p);
   if(p===1){this.airborne=false;this.y=0;this.landed=true;this.lastGrade='BEAU SAUT !';this.score+=100;}
  }else if(segmentAt(this.distance)?.kind!=='jump')this.distance+=this.speed*dt;
  const s=segmentAt(this.distance);
  if(!this.airborne&&!s&&this.distance<RACE_LENGTH){this.falling=true;this.fallTime=0;this.falls++;this.lastGrade='DANS LE VIDE !';return;}
  if(s&&!this.airborne&&s.index!==this.island){this.island=s.index;this.checkpoint=s.start+(s.kind==='jump'?s.length/2:6);this.crystals++;}
  if(this.distance>=RACE_LENGTH-7){this.distance=RACE_LENGTH-7;this.finished=true;this.finishTime=this.elapsed;this.speed=0;this.y=0;this.airborne=false;}
 }
 get remaining(){return (segmentAt(this.distance)?.end??this.distance)-this.distance;}
}
export class WolfRunner extends RaceRunner{
 update(dt){
  if(!this.finished&&!this.falling){
   if(this.lastTap==null||this.elapsed-this.lastTap>(this.tapInterval??.24)){this.tap();this.lastTap=this.elapsed;}
   if(!this.airborne&&this.remaining<9&&this.island<RACE_SEGMENTS.length-1)this.jump();
  }
  super.update(dt);
 }
 reset(){super.reset();this.lastTap=null;this.tapInterval=.24;this.maxSpeed=28;}
}
