import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [name,width,height] of [['final-desktop',1440,900],['final-mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<600,hasTouch:width<600});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5174');
  await page.waitForFunction(()=>window.__saturn&&!document.querySelector('#play').disabled,null,{timeout:120000});
  await page.locator('#course-monsegur').click();await page.locator('#play').click();await page.waitForTimeout(400);
  assert(!await page.evaluate(()=>__saturn.world.scene.getObjectByName('Cometes').visible));
  if(width<600){
   const mission=await page.locator('.mission').boundingBox(),progress=await page.locator('.progress-wrap').boundingBox();
   assert(mission.y>=progress.y+progress.height,'Mobile HUD panels overlap');
  }
  await page.screenshot({path:`test-results/monsegur/${name}.png`});
  if(width>600){
   await page.evaluate(()=>{const race=__saturn.race;race.started=false;race.state.distance=120;race.state.y=-4;race.state.falling=true;race.rival.distance=142;});
   await page.waitForTimeout(900);await page.screenshot({path:'test-results/monsegur/terrain-pont.png'});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Final desktop/mobile rendering verified');
}finally{await browser.close();}
