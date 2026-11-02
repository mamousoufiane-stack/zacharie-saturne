import {RaceRunner,WolfRunner,RACE_LENGTH,RACE_SEGMENTS} from './racing';
import {RaceWorld} from './race-world';
import {MonsegurWorld} from './monsegur-world';
import {speedometerMarkup,updateSpeedometer} from './speedometer';
export class RaceGame{
 constructor(world,ui){
  this.state=new RaceRunner();this.rival=new WolfRunner();this.view=new RaceWorld(world);this.saturnView=this.view;this.monsegurView=new MonsegurWorld(world);this.ready=Promise.all([this.view.ready,this.monsegurView.ready]);this.theme='saturn';this.ui=ui;
  const selector=document.createElement('div');selector.className='course-selector';selector.setAttribute('aria-label','Choisir le parcours');
  selector.innerHTML='<button id="course-classic" class="selected" aria-pressed="true"><small>01 · ORIGINAL</small>Le grand saut<span>36 astéroïdes · Espace</span></button><button id="course-race" aria-pressed="false"><small>02 · NOUVEAU</small>La course du loup<span>1,4 km · course + 3 sauts</span></button><button id="course-monsegur" aria-pressed="false"><small>03 · MONTAGNE</small>Montségur<span>Le défi du bouquetin</span></button>';
  document.querySelector('.menu-actions').before(selector);
  document.querySelector('.demo-note').innerHTML='TROIS PARCOURS · SATURNE & MONTSÉGUR';
  const panel=document.createElement('div');panel.id='race-panel';panel.innerHTML=speedometerMarkup()+'<div class="rival-readout"><small>LE LOUP</small><b id="race-lead">À tes côtés</b><span id="race-time">0:00</span></div>';
  document.querySelector('#hud').append(panel);
  const run=document.createElement('button');run.id='run';run.setAttribute('aria-label','Tapoter pour courir');run.innerHTML='X <small>COURIR</small>';document.querySelector('.jump-touch').append(run);
  document.querySelector('#menu h1').insertAdjacentHTML('beforebegin','<div class="v2-badge">V2 / LA COURSE COSMIQUE</div>');
 }
 select(name){
  this.stop();this.theme=name==='monsegur'?'monsegur':'saturn';this.view=this.theme==='monsegur'?this.monsegurView:this.saturnView;
  document.querySelector('.rival-readout small').textContent=this.theme==='monsegur'?'LE BOUQUETIN':'LE LOUP';
  const mountain=this.theme==='monsegur';
  document.body.classList.toggle('monsegur-selected',mountain);
  document.querySelector('.chapter').textContent=mountain?'MONDE 02 · MONTSÉGUR':'MONDE 01 · SATURNE';
  document.querySelector('.brand-copy small').textContent=mountain?'LES AVENTURES DE ZACHARIE':'LES AVENTURES COSMIQUES';
  document.querySelector('.bottom-menu>span').innerHTML=mountain?'03 <b>LE DÉFI DU BOUQUETIN</b>':name==='race'?'02 <b>LA COURSE DU LOUP</b>':'01 <b>LE GRAND SAUT</b>';
  document.querySelector('#menu h1').innerHTML=mountain?'LE DÉFI DE<br><em>MONTSÉGUR.</em>':'LE MONDE<br>DE <em>SATURNE.</em>';
  document.querySelector('.intro').innerHTML=mountain?'Cours avec le bouquetin sur les sentiers.<br>Franchis les gorges et les ponts de bois.':'Saute d’astéroïde en astéroïde.<br>Et fais briller tout l’univers.';
  document.querySelector('.v2-badge').textContent=mountain?'MONTSÉGUR / LA COURSE DU BOUQUETIN':'V2 / LA COURSE COSMIQUE';
  document.querySelector('#world-label').innerHTML=mountain?'<span>02</span><div>MONTSÉGUR<small>LES SENTIERS DES PYRÉNÉES</small></div><i>✧</i>':'<span>06</span><div>SATURNE<small>LE ROYAUME DES ANNEAUX</small></div><i>✧</i>';
  document.querySelector('#jump').setAttribute('aria-label',mountain?'Sauter vers le prochain rocher':'Sauter sur le prochain astéroïde');
  for(const id of ['classic','race','monsegur']){const b=document.querySelector('#course-'+id);b.classList.toggle('selected',name===id);b.setAttribute('aria-pressed',String(name===id));}
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
  $('#phase').textContent=this.theme==='monsegur'?'LA COURSE DE MONTSÉGUR':'LA COURSE DU LOUP';$('#score').textContent=Math.floor(p.score+p.distance*2);$('#crystals').textContent=p.crystals;
  $('#progress').value=p.distance/RACE_LENGTH*100;$('#progress-text').textContent=`${Math.min(RACE_SEGMENTS.length,p.island+1)} / ${RACE_SEGMENTS.length}`;
  $('#distance').textContent=`${Math.floor(p.distance)} / ${RACE_LENGTH} m`;
  $('#energy').value=p.energy;$('#sync-label').textContent=`${p.cadence.toFixed(1)} APPUIS / SECONDE`;
  $('.energy-panel>span').textContent='ÉNERGIE DE VITESSE';updateSpeedometer(p.speed);
  $('#race-lead').textContent=r.finished?(this.theme==='monsegur'?'Le bouquetin est arrivé':'Le loup est arrivé'):Math.abs(lead)<3?'À tes côtés':lead>0?`${Math.round(lead)} m devant`:`${Math.round(-lead)} m derrière`;
  $('#race-time').textContent=`${Math.floor(p.elapsed/60)}:${String(Math.floor(p.elapsed%60)).padStart(2,'0')}`;
  const small=RACE_SEGMENTS[p.island]?.kind==='jump';
  const near=p.remaining<=Math.max(12,p.speed*.55)&&p.island<RACE_SEGMENTS.length-1;
  $('#mission').textContent=p.falling?'Retour au dernier astéroïde…':p.airborne?'Garde ton élan !':near?(p.speed<8?'Accélère avec X avant de sauter !':'ESPACE ! Saute vers le prochain rocher'):'Tapote X : plus vite, plus fort !';
  $('#jump-hint').textContent=p.falling?'REPRENDS TON ÉLAN':p.airborne?'EN VOL':near?'ESPACE · SAUTE MAINTENANT':'X · ACCÉLÈRE / ESPACE · SAUTE';
  $('.jump-touch>small').textContent='TAPOTE X POUR COURIR · ESPACE POUR SAUTER';$('#lyric').textContent=['Roche de Saturne I','Roche de Saturne II','Roche de Saturne III'][p.island%3];
  if(this.theme==='monsegur'){ $('#lyric').textContent=RACE_SEGMENTS[p.island]?.model==='ambre'?'Les ponts des gorges':'Les sentiers de Montségur'; if(p.falling)$('#mission').textContent='Retour au dernier sentier…'; }
  if(small){$('#lyric').textContent=`Séquence de 3 sauts · ${RACE_SEGMENTS[p.island].step} / 3`;if(!p.airborne&&!p.falling)$('#mission').textContent='ESPACE : enchaîne le saut suivant !';}
 }
 result(){
  const win=!this.rival.finished||this.state.finishTime<=this.rival.finishTime;
  const title=this.theme==='monsegur'?'MONTSÉGUR · LE BOUQUETIN':'COURSE DU LOUP',animal=this.theme==='monsegur'?'le bouquetin':'le loup';
  return `<div class="eyebrow">${title} · ARRIVÉE</div><h2>${win?`Tu as battu ${animal} !`:`${animal[0].toUpperCase()+animal.slice(1)} gagne cette fois !`}</h2><p>${win?'Ton énergie a fait la différence.':'Tapote X plus régulièrement et prépare tes sauts pour la revanche.'}</p><div class="result-grid"><div><strong>${this.state.finishTime.toFixed(1)} s</strong><small>TON TEMPS</small></div><div><strong>${this.state.falls}</strong><small>CHUTES</small></div></div><div class="modal-actions"><button id="again" class="primary">REVANCHE ↗</button><button id="home" class="secondary">Menu</button></div>`;
 }
}

