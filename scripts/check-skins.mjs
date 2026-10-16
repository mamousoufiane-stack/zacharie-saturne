import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');await page.waitForFunction(()=>__saturn?.world.hero.skin==='original'&&!document.querySelector('#skin').disabled);
 await page.locator('#skin').click();await page.waitForFunction(()=>__saturn.world.hero.skin==='helmet'&&!document.querySelector('#skin').disabled);
 const result=await page.evaluate(()=>{let visor,parts=0;__saturn.world.hero.rig.traverse(o=>{if(o.isMesh){if(o.name.startsWith('Casque_'))parts++;if(o.material.name==='Visiere transparente')visor={transparent:o.material.transparent,opacity:o.material.opacity,skinned:o.isSkinnedMesh};}});return {parts,visor};});
 assert.ok(result.parts>=26);assert.ok(result.visor.transparent);assert.ok(result.visor.opacity<.2);assert.ok(result.visor.skinned);
 await page.screenshot({path:'test-results/helmet-menu.png'});
 await page.locator('#skin').click();await page.waitForFunction(()=>__saturn.world.hero.skin==='original');
 await page.locator('#skin').click();await page.waitForFunction(()=>__saturn.world.hero.skin==='helmet');await page.locator('#play').click();await page.keyboard.press('Space');await page.waitForFunction(()=>__saturn.state.island===1);await page.keyboard.press('Escape');
 await page.screenshot({path:'test-results/helmet-game.png'});assert.deepEqual(errors,[]);console.log('SKINS_OK',result,'JUMP_OK');
}finally{await browser.close();}
