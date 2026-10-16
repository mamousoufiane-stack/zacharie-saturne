import test from 'node:test';
import assert from 'node:assert/strict';
import {IslandJumper,JUMP_DURATION,LANDING_DELAY,COLLAPSE_DEADLINE,TOTAL_ISLANDS,islandDrop} from '../src/jumping.js';
test('start waits safely; in-flight and early landing taps are never buffered',()=>{
 const s=new IslandJumper();s.update(10);assert.equal(s.y,0);assert.ok(s.jump());s.update(JUMP_DURATION-.1);assert.equal(s.jump(),false);s.update(.1);assert.equal(s.airborne,false);assert.equal(s.jump(),false);s.update(LANDING_DELAY+.01);assert.equal(s.airborne,false);assert.ok(s.jump());
});
test('impact sinks platform and hero; departure preserves height; waiting too long loses',()=>{
 const s=new IslandJumper();s.jump();s.update(JUMP_DURATION);s.update(.3);assert.ok(s.y<0);assert.equal(s.y,islandDrop(s.groundAge));const y=s.y;assert.ok(s.jump());assert.equal(s.y,y);s.update(JUMP_DURATION);s.update(COLLAPSE_DEADLINE+.01);assert.ok(s.falling);assert.equal(s.jump(),false);s.update(1);assert.ok(s.failed);s.reset();assert.equal(s.failed,false);assert.deepEqual(s.impacts,{});
});
test('all 36 islands remain reachable with timed taps; final platform stays safe',()=>{
 const s=new IslandJumper();for(let i=0;i<TOTAL_ISLANDS;i++){assert.ok(s.jump());s.update(JUMP_DURATION);assert.equal(s.island,i+1);assert.equal(s.y,0);s.update(.3);}s.update(10);assert.equal(s.failed,false);assert.equal(s.y,0);assert.equal(s.jump(),false);assert.equal(s.crystals,TOTAL_ISLANDS);
});
