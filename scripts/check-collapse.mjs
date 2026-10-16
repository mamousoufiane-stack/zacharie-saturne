import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.GAME_URL||'http://localhost:5173');
 await page.waitForFunction(()=>window.__saturn?.world.hero.status==='ready'&&!document.querySelector('#play').disabled);
 await page.locator('#play').click();await page.waitForFunction(()=>__saturn.mode==='playing');
 const result=await page.evaluate(()=>{
  const {state:s,world:w}=__saturn;s.jump();s.update(1.05);const early=s.jump();s.update(.3);w.update(s,0,'tempo',true);
  const ground=w.islands[1].root.position.y,hero=w.hero.root.position.y,valid=s.jump();s.update(1.05);s.update(.9);w.update(s,0,'tempo',true);
  let clocks=0;w.scene.traverse(o=>{if(o.geometry?.type==='TorusGeometry'&&o.geometry.parameters.radius===1.4)clocks++;});
  return {early,valid,ground,hero,falling:s.falling,clocks};
 });
 assert.equal(result.early,false);assert.equal(result.valid,true);assert.ok(result.ground<0);assert.ok(Math.abs(result.hero-result.ground-.015)<.001);assert.ok(result.falling);assert.equal(result.clocks,0);
 await page.waitForFunction(()=>__saturn.mode==='lost');await page.locator('#again').click();await page.waitForFunction(()=>__saturn.mode==='playing'&&__saturn.state.island===0);
 assert.deepEqual(errors,[]);console.log('COLLAPSE_OK',result,'RESTART_OK');
}finally{await browser.close();}
