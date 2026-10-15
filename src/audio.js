import source from './data/saturnTimeline.json';
import {currentEvent,validateTimeline} from './gameplay';
export class MusicDirector{
 constructor(){this.config=structuredClone(source);this.audio=new Audio();this.audio.preload='metadata';this.demo=true;this.time=0;this.playing=false;this.duration=104;this.url=null;this.volume=.65;this.ctx=null;this.lastBeat=-1;this.audio.addEventListener('ended',()=>{this.playing=false});}
 async loadBundled(){const files=import.meta.glob('/public/audio/*.mp3',{query:'?url',import:'default'});const loader=Object.values(files)[0];if(!loader)return false;const url=await loader();this.audio.src=url;await new Promise((resolve,reject)=>{this.audio.onloadedmetadata=resolve;this.audio.onerror=()=>reject(Error('Audio embarqué illisible'))});this.demo=false;this.duration=this.audio.duration;return true}
 get events(){return this.demo?this.config.events.map((e,i)=>({...e,start:i*8,end:(i+1)*8})):this.config.events}
 get active(){return currentEvent(this.events,this.time)}
 async play(){if(!this.demo){await this.audio.play()}this.playing=true;}
 pause(){this.playing=false;this.audio.pause()}
 seek(t){this.time=Math.max(0,Math.min(t,this.duration));if(!this.demo)this.audio.currentTime=this.time;this.lastBeat=-1}
 update(dt){if(this.playing)this.time=this.demo?Math.min(this.duration,this.time+dt):this.audio.currentTime;return this.active}
 loadFile(file){this.pause();if(this.url)URL.revokeObjectURL(this.url);this.url=URL.createObjectURL(file);this.audio.src=this.url;this.demo=false;this.time=0;return new Promise((resolve,reject)=>{this.audio.onloadedmetadata=()=>{this.duration=this.audio.duration;resolve()};this.audio.onerror=()=>reject(Error('Ce fichier audio ne peut pas être lu.'))})}
 useDemo(){this.pause();this.demo=true;this.duration=104;this.time=0}
 import(data){this.config=validateTimeline(data)}
 setVolume(v){this.volume=v;this.audio.volume=v;if(this.gain)this.gain.gain.value=v*.07}
 enableSynth(){if(!this.ctx){this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.gain=this.ctx.createGain();this.gain.gain.value=this.volume*.07;this.gain.connect(this.ctx.destination)}this.ctx.resume()}
 tickSynth(){if(!this.demo||!this.playing||!this.ctx)return;const beat=Math.floor(this.time*2);if(beat===this.lastBeat)return;this.lastBeat=beat;const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type='sine';osc.frequency.value=[261.63,329.63,392,523.25,440,392,329.63,293.66][beat%8];gain.gain.setValueAtTime(.6,this.ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.3);osc.connect(gain);gain.connect(this.gain);osc.start();osc.stop(this.ctx.currentTime+.32)}
}
