// Vector dial inspired by the user's reference; the readout is the real race speed.
const point=(p,r=77)=>{const a=(150+p*240)*Math.PI/180;return [100+Math.cos(a)*r,92+Math.sin(a)*r];};
const arc=(a,b,r=77)=>{const p=point(a,r),q=point(b,r);return `M ${p} A ${r} ${r} 0 0 1 ${q}`;};
export function speedometerMarkup(){
 const colors=['#008aff','#05b8ff','#37dbff','#69e7ff','#a6efff','#ffdd75','#ffae49','#ff7044'];
 const bands=colors.map((c,i)=>`<path d="${arc(i/8+.006,(i+1)/8-.006)}" stroke="${c}"/>`).join('');
 const ticks=Array.from({length:17},(_,i)=>{const a=point(i/16,i%2?63:59),b=point(i/16,68);return `<path d="M ${a} L ${b}" opacity="${i%2?.45:.9}"/>`;}).join('');
 return `<div id="speedometer" role="meter" aria-label="Vitesse en kilomètres par heure" aria-valuemin="0" aria-valuemax="110" aria-valuenow="0">
 <svg viewBox="0 0 200 154" aria-hidden="true">
 <defs><radialGradient id="dial-face"><stop stop-color="#263f58"/><stop offset="1" stop-color="#071422"/></radialGradient><linearGradient id="dial-rim" x2="0" y2="1"><stop stop-color="#dcf9ff"/><stop offset=".45" stop-color="#47879c"/><stop offset="1" stop-color="#142c47"/></linearGradient></defs>
 <path d="${arc(0,1,85)}" fill="none" stroke="#040c1a" stroke-width="25" stroke-linecap="round"/>
 <path d="${arc(0,1,85)}" fill="none" stroke="url(#dial-rim)" stroke-width="18" stroke-linecap="round"/>
 <path d="M 39 137 A 74 74 0 1 1 161 137 Q 100 155 39 137" fill="url(#dial-face)" stroke="#071327" stroke-width="4"/>
 <g fill="none" stroke-width="13">${bands}</g>
 <g fill="none" stroke="#c3f5ff" stroke-width="2">${ticks}</g>
 <g id="speed-marker"><path d="M 43 125 L 33 136 L 48 134 Z" fill="#fff" stroke="#6eeaff" stroke-width="1.4"/></g>
 <text id="race-speed" x="100" y="100" text-anchor="middle">0</text>
 <text class="speed-unit" x="100" y="125" text-anchor="middle">km/h</text>
 </svg></div>`;
}
export function updateSpeedometer(speed){
 const kmh=Math.round(speed*3.6),dial=document.querySelector('#speedometer');
 document.querySelector('#race-speed').textContent=kmh;
 dial.setAttribute('aria-valuenow',String(kmh));
 document.querySelector('#speed-marker').setAttribute('transform',`rotate(${Math.min(1,kmh/110)*240} 100 92)`);
}
