import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results/v2',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
const url=process.env.GAME_URL||'http://127.0.0.1:5174';
try{
 await page.goto(url);await page.waitForFunction(()=>window.__saturn?.race.view.wolfLoaded&&!document.querySelector('#play').disabled,null,{timeout:90000});
 await page.screenshot({path:'test-results/v2/menu.png'});
 await page.locator('#play').click();await page.keyboard.press('Space');await page.waitForFunction(()=>__saturn.state.airborne);
 await page.waitForFunction(()=>__saturn.state.island===1&&!__saturn.state.airborne);await page.keyboard.press('Escape');
 assert.equal(await page.evaluate(()=>__saturn.mode),'paused');
 await page.locator('#home').click();await page.locator('#course-race').click();await page.locator('#play').click();
 await page.waitForTimeout(400);
 const initial=await page.evaluate(()=>__saturn.race.state.distance);assert.equal(initial,7);
 await page.screenshot({path:'test-results/v2/depart-loup.png'});
 // Holding X only counts the first physical keydown, including repeat filtering.
 await page.keyboard.down('x');for(let i=0;i<8;i++)await page.keyboard.down('x');await page.keyboard.up('x');
 assert((await page.evaluate(()=>__saturn.race.state.taps.length))<=1);
 for(let i=0;i<20;i++){await page.keyboard.press('x');await page.waitForTimeout(90);}
 const running=await page.evaluate(()=>({speed:__saturn.race.state.speed,aura:__saturn.race.view.aura.visible,clip:__saturn.world.hero.animation,tracks:__saturn.world.hero.mixer._actions.find(a=>a.getClip().name==='Run')?.getClip().tracks.length,distance:__saturn.race.state.distance,wolf:__saturn.race.rival.distance}));
 console.log('RUNNING',running);assert(running.speed>10);assert(running.aura);assert.equal(running.clip,'Run');assert(running.tracks>=8);
 await page.screenshot({path:'test-results/v2/course.png'});
 await page.keyboard.press('Escape');const paused=await page.evaluate(()=>[__saturn.race.state.distance,__saturn.race.rival.distance]);await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>[__saturn.race.state.distance,__saturn.race.rival.distance]),paused);
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{const p=__saturn.race.state;p.distance=104;p.speed=22;p.taps=[p.elapsed,p.elapsed,p.elapsed,p.elapsed,p.elapsed];});
 await page.keyboard.press('Space');await page.waitForFunction(()=>__saturn.race.state.airborne);await page.waitForTimeout(180);await page.screenshot({path:'test-results/v2/saut.png'});
 await page.waitForFunction(()=>__saturn.race.state.island===1&&!__saturn.race.state.airborne,null,{timeout:15000});assert(!await page.evaluate(()=>__saturn.race.state.falling));
 // Advance the same race logic over the entire course; input and animation already tested above.
 await page.keyboard.press('Escape');
 const result=await page.evaluate(()=>{const p=__saturn.race.state,r=__saturn.race.rival;p.reset();r.reset();for(let n=0;n<12000&&!p.finished;n++){if(n%9===0)p.tap();if(p.remaining<10&&p.island<12)p.jump();p.update(.02);r.update(.02);}return {finished:p.finished,falls:p.falls,time:p.finishTime};});
 assert(result.finished);assert.equal(result.falls,0);await page.keyboard.press('Escape');await page.waitForFunction(()=>__saturn.mode==='finished');
 await page.screenshot({path:'test-results/v2/arrivee.png'});console.log('COMPLETE',result);
 await page.locator('#home').click();await page.locator('#course-classic').click();await page.locator('#play').click();assert.equal(await page.evaluate(()=>__saturn.course),'classic');assert(!await page.evaluate(()=>__saturn.race.view.root.visible));
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto(url);await mobile.waitForFunction(()=>window.__saturn?.race.view.wolfLoaded&&!document.querySelector('#play').disabled,null,{timeout:90000});await mobile.screenshot({path:'test-results/v2/mobile-menu.png'});
 assert(!await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await mobile.locator('#course-race').tap();await mobile.locator('#play').tap();for(let i=0;i<8;i++)await mobile.locator('#run').tap();
 assert(await mobile.evaluate(()=>__saturn.race.state.speed>0));await mobile.locator('#jump').tap();assert(await mobile.evaluate(()=>__saturn.race.state.airborne));await mobile.screenshot({path:'test-results/v2/mobile-course.png'});
 console.log('ERRORS',errors);assert.deepEqual(errors,[]);
}finally{await browser.close();}

