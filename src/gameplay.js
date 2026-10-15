export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const IDEAL={intro:[12,22],meteor:[16,25],fragile:[14,20],wind:[19,26],tempo:[17,23],gold:[22,29],glow:[20,28],flight:[23,31],control:[15,21],final:[18,29]};
export function speedStatus(speed,range){return speed<range[0]?'slow':speed>range[1]?'fast':'perfect'}
export function validateTimeline(data){if(!Array.isArray(data.events)||!data.events.length)throw Error('Une liste events est requise.');const ids=new Set();for(const e of data.events){if(!e.id||ids.has(e.id))throw Error('Identifiants manquants ou dupliqués.');ids.add(e.id);if(e.start!==null&&(!Number.isFinite(e.start)||e.start<0))throw Error('Temps de début invalide.');if(e.end!=null&&(!Number.isFinite(e.end)||e.end<e.start))throw Error('Temps de fin invalide.');if(!Object.hasOwn(IDEAL,e.type))throw Error('Type inconnu : '+e.type)}return data}
export function currentEvent(events,time){return [...events].filter(e=>e.start!==null&&e.start<=time).sort((a,b)=>a.start-b.start).at(-1)||null}
export class RunnerState{
 constructor(){this.reset()}
 reset(){this.distance=0;this.speed=19;this.lane=0;this.x=0;this.y=0;this.vy=0;this.jumps=0;this.score=0;this.crystals=0;this.energy=100;this.recovery=0;this.perfect=0;this.elapsed=0;this.falls=0}
 jump(){if(this.jumps>=2||this.recovery>0)return false;this.vy=this.jumps?9:11.5;this.jumps++;return true}
 update(dt,input,type){const range=IDEAL[type]||IDEAL.intro;this.speed=clamp(this.speed+((input.accel?10:0)-(input.brake?12:0))*dt,8,36);this.x+=(this.lane*2.25-this.x)*(1-Math.exp(-11*dt));this.distance+=this.speed*dt;this.elapsed+=dt;this.recovery=Math.max(0,this.recovery-dt);this.vy-=24*dt;this.y+=this.vy*dt;if(this.y<=0){this.y=0;this.vy=0;this.jumps=0}const status=speedStatus(this.speed,range);this.energy=clamp(this.energy+(status==='perfect'?5:-4)*dt,0,100);this.score+=(status==='perfect'?35:10)*dt;if(status==='perfect')this.perfect+=dt;return status}
 rescue(){if(this.recovery>0)return false;this.recovery=2.3;this.falls++;this.energy=Math.max(0,this.energy-12);this.y=2.2;this.vy=3;this.jumps=1;return true}
}
