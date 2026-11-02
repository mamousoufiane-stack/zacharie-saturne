import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();
 let release;
 const held=new Promise(resolve=>{release=resolve;});
 await page.route('**/models/zacharie-hunyuan.glb*',async route=>{await held;await route.continue();});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5174',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__saturn);
 await page.waitForTimeout(300);
 assert.deepEqual(await page.evaluate(()=>({status:__saturn.world.hero.status,visible:__saturn.world.hero.rig.visible,disabled:document.querySelector('#play').disabled})),{status:'loading',visible:false,disabled:true});
 release();
 await page.waitForFunction(()=>__saturn.world.hero.status==='ready',null,{timeout:90000});
 assert(await page.evaluate(()=>__saturn.world.hero.rig.visible&&__saturn.world.hero.rig.name==='Zacharie'));
 console.log('Delayed loading: no temporary character; final Zacharie visible.');
 await page.close();
 const failed=await browser.newPage();
 await failed.route('**/models/zacharie-hunyuan.glb*',route=>route.abort());
 await failed.goto(process.env.GAME_URL||'http://127.0.0.1:5174',{waitUntil:'domcontentloaded'});
 await failed.waitForFunction(()=>window.__saturn?.world.hero.status==='fallback',null,{timeout:90000});
 assert(await failed.evaluate(()=>__saturn.world.hero.rig.visible));
 console.log('Failed loading: emergency character remains available.');
}finally{await browser.close();}
