// One action only. UI interactions are never treated as jumps.
export function controls({jump,pause}){
 window.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.repeat)return;if(e.code==='Space'){e.preventDefault();jump()}if(e.code==='Escape')pause()});
 document.addEventListener('pointerdown',e=>{if(e.button!==0||!document.body.classList.contains('playing'))return;if(e.target.closest('button,a,input,select,textarea,dialog,#studio'))return;e.preventDefault();jump()});
 const b=document.querySelector('#jump');if(b)b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();jump()});return {};
}
