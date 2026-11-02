import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results/comets',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [name,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5174');
  await page.waitForFunction(()=>window.__saturn&&!document.querySelector('#play').disabled&&__saturn.world.scene.getObjectByName('Cometes')?.children.length===2,null,{timeout:90000});
  await page.locator('#course-race').click();await page.locator('#play').click();
  for(const speed of [0,14,28]){
   await page.evaluate(speed=>{const r=__saturn.race;r.started=false;r.state.speed=speed;},speed);
   await page.waitForFunction(value=>document.querySelector('#race-speed').textContent===value,String(Math.round(speed*3.6)),{timeout:15000});
   assert.equal(await page.locator('#race-speed').textContent(),String(Math.round(speed*3.6)));
   assert.equal(await page.locator('#speedometer').getAttribute('aria-valuenow'),String(Math.round(speed*3.6)));
  }
  await page.evaluate(()=>{const group=__saturn.world.scene.getObjectByName('Cometes');group.children[0].position.set(15,12,-60);group.children[0].visible=true;});
  await page.screenshot({path:`test-results/comets/${name}.png`});
  const box=await page.locator('#speedometer').boundingBox();assert(box.x>=0&&box.x+box.width<=width);assert(box.y>=0&&box.y+box.height<=height);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  const old=await page.evaluate(()=>{let found=false;__saturn.world.scene.traverse(o=>{if(o.geometry?.type==='ConeGeometry'&&o.geometry.parameters.height===10)found=true;});return found;});assert(!old);
  assert.deepEqual(errors,[]);console.log(name,'gauge and comet assets OK');await page.close();
 }
}finally{await browser.close();}
