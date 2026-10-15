export const ISLAND_SPACING=11;
export const JUMP_DURATION=1.05;
export const TOTAL_ISLANDS=36;
export class IslandJumper {
 constructor(){this.reset()}
 reset(){this.distance=0;this.x=0;this.y=0;this.speed=0;this.lane=0;this.island=0;this.jumpTime=0;this.airborne=false;this.jumps=0;this.score=0;this.crystals=0;this.energy=100;this.recovery=0;this.perfect=0;this.elapsed=0;this.falls=0;this.landed=false;this.buffered=false;this.lastGrade='À TOI DE SAUTER';}
 jump(time=0){if(this.island>=TOTAL_ISLANDS)return false;if(this.airborne){if(this.jumpTime>JUMP_DURATION-.16)this.buffered=true;return false}this.airborne=true;this.jumpTime=0;this.jumps=1;this.speed=ISLAND_SPACING/JUMP_DURATION;const phase=(time*2)%1;this.onBeat=Math.min(phase,1-phase)<.22;this.lastGrade=this.onBeat?'DANS LE TEMPO !':'BEAU SAUT !';return true}
 update(dt){this.elapsed+=dt;this.landed=false;if(!this.airborne){this.speed=0;return}this.jumpTime=Math.min(JUMP_DURATION,this.jumpTime+dt);const p=this.jumpTime/JUMP_DURATION;this.distance=(this.island+p)*ISLAND_SPACING;this.y=4*3.6*p*(1-p);if(p>=1){this.island++;this.distance=this.island*ISLAND_SPACING;this.y=0;this.airborne=false;this.jumps=0;this.speed=0;this.landed=true;this.crystals++;this.score+=this.onBeat?150:100;if(this.onBeat)this.perfect++;if(this.buffered){this.buffered=false;this.jump(this.elapsed)}}}
 seekToIsland(n){this.reset();this.island=Math.max(0,Math.min(TOTAL_ISLANDS,Math.floor(n)));this.distance=this.island*ISLAND_SPACING;}
}
