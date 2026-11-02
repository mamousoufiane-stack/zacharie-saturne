import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RACE_SEGMENTS} from '../src/racing.js';
fs.mkdirSync('test-results/relief',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto('http://127.0.0.1:5174');
 await page.waitForFunction(()=>window.__saturn?.race.view.heights&&!document.querySelector('#play').disabled,null,{timeout:90000});
 await page.locator('#course-race').click();await page.locator('#play').click();
 for(const sequence of [1,2]){
  const stones=RACE_SEGMENTS.filter(s=>s.sequence===sequence),first=stones[0],previous=RACE_SEGMENTS[first.index-1];
  await page.evaluate(({d,index})=>{const r=__saturn.race;r.started=false;Object.assign(r.state,{distance:d,island:index,speed:24});r.state.taps=Array(6).fill(r.state.elapsed);r.rival.distance=d+2;__saturn.world.camera.position.set(0,8.5,-d+17);},{d:previous.end-8,index:previous.index});
  await page.waitForTimeout(200);await page.screenshot({path:`test-results/relief/sequence-${sequence}.png`});
  for(const index of [first.index,first.index+1,first.index+2]){
   await page.keyboard.press('Space');
   await page.waitForFunction(i=>__saturn.race.state.island===i&&!__saturn.race.state.airborne,index,{timeout:15000});
   assert(!await page.evaluate(()=>__saturn.race.state.falling));
   if(index===first.index){
    const d=await page.evaluate(()=>__saturn.race.state.distance);await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>__saturn.race.state.distance),d);
    await page.screenshot({path:`test-results/relief/petit-rocher-${sequence}.png`});
   }
  }
 }
 assert.deepEqual(errors,[]);console.log('TWO THREE-JUMP SEQUENCES PASSED; no browser errors');
}finally{await browser.close();}
