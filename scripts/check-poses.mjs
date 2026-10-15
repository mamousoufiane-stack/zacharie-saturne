import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:900,height:1000}});
await page.goto('http://localhost:5173');await page.waitForFunction(()=>window.__saturn?.world.hero.status==='ready');
await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
await page.evaluate(()=>{
 const w=__saturn.world;document.querySelector('#app').style.display='none';
 document.querySelectorAll('header,section,aside,dialog,.bottom-menu,#world-label,.grain').forEach(o=>o.style.display='none');
 w.hero.root.position.set(0,0,0);w.hero.root.rotation.set(0,Math.PI,0);w.hero.root.scale.setScalar(1);
 w.camera.position.set(3,2.7,6);w.camera.lookAt(0,1.4,0);
 w.islands.forEach(i=>i.root.visible=false);w.decor.visible=false;w.targetMarker.visible=false;
});
for(const [clip,time] of [['Idle',1],['JumpStart',.07],['JumpAir',.4],['Land',.12],['Victory',.4]]){
 await page.evaluate(({clip,time})=>{const w=__saturn.world;w.hero.animate(clip);w.hero.mixer.update(time);w.render();},{clip,time});
 await page.screenshot({path:'test-results/pose-'+clip+'.png'});
}
await browser.close();
