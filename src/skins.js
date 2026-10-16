export function setupSkins(world){
 const button=document.createElement('button');button.id='skin';button.className='secondary';button.textContent='Tenue : originale';button.disabled=true;
 document.querySelector('.menu-actions').append(button);
 world.ready.then(()=>{button.disabled=false;});
 button.onclick=async()=>{
  const skin=world.hero.skin==='helmet'?'original':'helmet';const play=document.querySelector('#play');button.disabled=true;play.disabled=true;button.textContent='Préparation de la tenue…';
  try{await world.hero.setSkin(skin);world.feetOffset=0;button.textContent=skin==='helmet'?'Tenue : casque spatial':'Tenue : originale';}
  catch(e){console.error(e);button.textContent='Chargement impossible — réessayer';}
  finally{button.disabled=false;play.disabled=false;}
 };
 document.querySelector('#credits').addEventListener('click',()=>{
  const p=document.createElement('p');p.innerHTML='Casque : <a href="https://sketchfab.com/3d-models/space-helmet-4135c92041514754829013181fbc7ee6" target="_blank" rel="noopener">space helmet</a> par J4747, sous CC BY 4.0. Adaptations : ajustement à Zacharie, visière transparente et liaison au squelette.';
  document.querySelector('#modal-content').append(p);
 });
}
