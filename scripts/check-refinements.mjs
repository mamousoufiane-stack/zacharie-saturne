import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results/refinements',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto('http://127.0.0.1:5174');await page.waitForFunction(()=>window.__saturn?.race.view.finishGate&&!document.querySelector('#play').disabled,null,{timeout:90000});
 await page.locator('#course-race').click();await page.locator('#play').click();
 for(const [name,d]of [['basalte',48],['ambre',180],['glace',335],['arrivee',1312]]){
  await page.evaluate(d=>{const r=__saturn.race;r.started=false;r.state.distance=d;r.state.speed=26;r.rival.distance=d+2;r.rival.speed=20;__saturn.world.camera.position.set(0,8.5,-d+17);},d);
  await page.waitForTimeout(500);await page.screenshot({path:`test-results/refinements/${name}.png`});
 }
 const assets=await page.evaluate(()=>({gate:__saturn.race.view.finishGate.name,aura:__saturn.race.view.aura.name,rocks:__saturn.race.view.rocks.length}));
 assert.equal(assets.rocks,9);assert.deepEqual(errors,[]);console.log('REFINEMENTS',assets,'ERRORS',errors);
}finally{await browser.close();}
