import test from 'node:test';
import assert from 'node:assert/strict';
import {RaceRunner,WolfRunner,RACE_SEGMENTS,RACE_LENGTH} from '../src/racing.js';
function tick(r,seconds,rate=0){let next=0;for(let t=0;t<seconds;t+=.02){if(rate&&t>=next){r.tap();next+=1/rate;}r.update(.02);}}
test('nine long platforms include two sequences of exactly three jumps',()=>{
 const runs=RACE_SEGMENTS.filter(s=>s.kind==='run');assert.equal(runs.length,9);assert.equal(new Set(runs.map(s=>s.model)).size,3);assert(runs.every(s=>s.length>=110));assert(RACE_LENGTH>1200);
 for(const sequence of [1,2]){const stones=RACE_SEGMENTS.filter(s=>s.sequence===sequence);assert.equal(stones.length,2);assert.equal(stones[1].index,stones[0].index+1);assert.equal(RACE_SEGMENTS[stones[0].index-1].kind,'run');assert.equal(RACE_SEGMENTS[stones[1].index+1].kind,'run');}
});

test('small stones wait for Space and allow chained jumps even after speed decays',()=>{
 const stones=RACE_SEGMENTS.filter(s=>s.sequence===1),r=new RaceRunner();r.distance=RACE_SEGMENTS[stones[0].index-1].end-8;r.speed=24;
 for(const stone of stones){assert(r.jump());tick(r,r.jumpDuration+.1);assert(!r.falling);assert.equal(r.island,stone.index);const d=r.distance;tick(r,4);assert.equal(r.distance,d);}
 assert(r.jump());tick(r,1.1);assert(!r.falling);assert.equal(r.island,stones[1].index+1);
});
test('no taps means no movement; faster taps mean higher speed',()=>{const idle=new RaceRunner();tick(idle,3);assert.equal(idle.distance,7);const slow=new RaceRunner(),fast=new RaceRunner();tick(slow,3,2);tick(fast,3,6);assert(fast.speed>slow.speed+8);assert(fast.energy>70);});
test('speed decays after tapping stops',()=>{const r=new RaceRunner();tick(r,2,6);const speed=r.speed;tick(r,1.3);assert(r.speed<speed*.5);});
test('edge jump with momentum lands safely on next asteroid',()=>{const r=new RaceRunner();r.distance=RACE_SEGMENTS[0].end-8;r.speed=18;assert(r.jump());assert(!r.jump());tick(r,1.5);assert(!r.falling);assert.equal(r.island,1);assert(r.distance>=RACE_SEGMENTS[1].start);});
test('walking into a gap causes a fall and checkpoint recovery',()=>{const r=new RaceRunner();r.distance=RACE_SEGMENTS[0].end-.1;r.speed=20;r.update(.02);assert(r.falling);tick(r,1.6);assert(!r.falling);assert.equal(r.distance,7);assert.equal(r.falls,1);});
test('AI wolf completes entire course without falling',()=>{const r=new WolfRunner();tick(r,150);assert(r.finished);assert.equal(r.falls,0);assert(r.finishTime>40);});
test('a player can finish the entire race with timed jumps and repeated taps',()=>{const r=new RaceRunner();for(let n=0;n<10000&&!r.finished;n++){if(n%9===0)r.tap();if(r.remaining<10&&r.island<RACE_SEGMENTS.length-1)r.jump();r.update(.02);}assert(r.finished);assert.equal(r.falls,0);assert(r.finishTime<100);});
