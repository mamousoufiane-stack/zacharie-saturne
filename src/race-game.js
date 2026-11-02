import {RaceRunner,WolfRunner,RACE_LENGTH,RACE_SEGMENTS} from './racing';
import {RaceWorld} from './race-world';
export class RaceGame{
 constructor(world,ui){
  this.state=new RaceRunner();this.rival=new WolfRunner();this.view=new RaceWorld(world);this.ready=this.view.ready;this.ui=ui;
  const selector=document.createElement('div');selector.className='course-selector';selector.setAttribute('aria-label','Choisir le parcours');
  selector.innerHTML='<button id="course-classic" class="selected" aria-pressed="true"><small>01 · ORIGINAL</small>Le grand saut<span>36 astéroïdes · Espace</span></button><button id="course-race" aria-pressed="false"><small>02 · NOUVEAU</small>La course du loup<span>1,4 km · course + 3 sauts</span></button>';
  document.querySelector('.menu-actions').before(selector);
  document.querySelector('.demo-note').innerHTML='VERSION 2 · DEUX PARCOURS';
  const panel=document.createElement('div');panel.id='race-panel';panel.innerHTML='<div><small>VITESSE</small><strong id="race-speed">0</strong><span>km/h</span></div><div><small>LE LOUP</small><b id="race-lead">À tes côtés</b><span id="race-time">0:00</span></div>';
  document.querySelector('#hud').append(panel);
  const run=document.createElement('button');run.id='run';run.setAttribute('aria-label','Tapoter pour courir');run.innerHTML='X <small>COURIR</small>';document.querySelector('.jump-touch').append(run);
  document.querySelector('#menu h1').insertAdjacentHTML('beforebegin','<div class="v2-badge">V2 / LA COURSE COSMIQUE</div>');
 }
 select(name){
  for(const id of ['classic','race']){const b=document.querySelector('#course-'+id);b.classList.toggle('selected',name===id);b.setAttribute('aria-pressed',String(name===id));}
 }
 start(){this.started=false;this.state.reset();this.rival.reset();this.view.setActive(true);document.body.classList.add('race-playing');this.view.world.hero.reset();}
 stop(){this.view.setActive(false);document.body.classList.remove('race-playing');}
 jump(){this.started=true;return this.state.jump();}
 tap(){this.started=true;this.state.tap();}
 update(dt,playing=true){
  if(playing&&this.started){
   const gap=this.state.distance-this.rival.distance;
   this.rival.tapInterval=this.state.island<RACE_SEGMENTS.length-1?Math.max(.17,Math.min(.28,.24-gap*.012)):.24;
   this.rival.maxSpeed=this.state.island<RACE_SEGMENTS.length-1?28+Math.min(6,Math.max(0,gap-5)*.5):28;
   this.state.update(dt);this.rival.update(dt);
  }
  this.view.update(this.state,this.rival,dt,playing);this.hud();
 }
 hud(){
  const $=s=>document.querySelector(s),p=this.state,r=this.rival,lead=p.distance-r.distance;
  $('#phase').textContent='LA COURSE DU LOUP';$('#score').textContent=Math.floor(p.score+p.distance*2);$('#crystals').textContent=p.crystals;
  $('#progress').value=p.distance/RACE_LENGTH*100;$('#progress-text').textContent=`${Math.min(RACE_SEGMENTS.length,p.island+1)} / ${RACE_SEGMENTS.length}`;
  $('#distance').textContent=`${Math.floor(p.distance)} / ${RACE_LENGTH} m`;
  $('#energy').value=p.energy;$('#sync-label').textContent=`${p.cadence.toFixed(1)} APPUIS / SECONDE`;
  $('.energy-panel>span').textContent='ÉNERGIE DE VITESSE';$('#race-speed').textContent=Math.round(p.speed*3.6);
  $('#race-lead').textContent=r.finished?'Le loup est arrivé':Math.abs(lead)<3?'À tes côtés':lead>0?`${Math.round(lead)} m devant`:`${Math.round(-lead)} m derrière`;
  $('#race-time').textContent=`${Math.floor(p.elapsed/60)}:${String(Math.floor(p.elapsed%60)).padStart(2,'0')}`;
  const small=RACE_SEGMENTS[p.island]?.kind==='jump';
  const near=p.remaining<=Math.max(12,p.speed*.55)&&p.island<RACE_SEGMENTS.length-1;
  $('#mission').textContent=p.falling?'Retour au dernier astéroïde…':p.airborne?'Garde ton élan !':near?(p.speed<8?'Accélère avec X avant de sauter !':'ESPACE ! Saute vers le prochain rocher'):'Tapote X : plus vite, plus fort !';
  $('#jump-hint').textContent=p.falling?'REPRENDS TON ÉLAN':p.airborne?'EN VOL':near?'ESPACE · SAUTE MAINTENANT':'X · ACCÉLÈRE / ESPACE · SAUTE';
  $('.jump-touch>small').textContent='TAPOTE X POUR COURIR · ESPACE POUR SAUTER';$('#lyric').textContent=['Roche de Saturne I','Roche de Saturne II','Roche de Saturne III'][p.island%3];
  if(small){$('#lyric').textContent=`Séquence de 3 sauts · ${RACE_SEGMENTS[p.island].step} / 3`;if(!p.airborne&&!p.falling)$('#mission').textContent='ESPACE : enchaîne le saut suivant !';}
 }
 result(){
  const win=!this.rival.finished||this.state.finishTime<=this.rival.finishTime;
  return `<div class="eyebrow">COURSE DU LOUP · ARRIVÉE</div><h2>${win?'Tu as battu le loup !':'Le loup gagne cette fois !'}</h2><p>${win?'Ton énergie a fait la différence.':'Tapote X plus régulièrement et prépare tes sauts pour la revanche.'}</p><div class="result-grid"><div><strong>${this.state.finishTime.toFixed(1)} s</strong><small>TON TEMPS</small></div><div><strong>${this.state.falls}</strong><small>CHUTES</small></div></div><div class="modal-actions"><button id="again" class="primary">REVANCHE ↗</button><button id="home" class="secondary">Menu</button></div>`;
 }
}

