'use strict';
const CONFIG={duration:60,speed:460,spawnEvery:0.58,meteorChance:0.25,starScore:10};
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const hud={score:document.querySelector('#score'),lives:document.querySelector('#lives'),time:document.querySelector('#time'),best:document.querySelector('#best'),combo:document.querySelector('#combo'),status:document.querySelector('#status'),start:document.querySelector('#start'),pause:document.querySelector('#pause')};
const starImage=new Image();starImage.src='./assets/star.svg';
let running=false,paused=false,score=0,lives=3,elapsed=0,spawn=0,items=[],player=400,last=0,keys=new Set(),combo=0,best=Number(localStorage.getItem('starCatcherBest')||0),stars=[];
hud.best.textContent=best;
for(let i=0;i<90;i++)stars.push({x:Math.random()*800,y:Math.random()*450,r:Math.random()*1.8,s:.3+Math.random()*1.4});
function startGame(){running=true;paused=false;score=0;lives=3;elapsed=0;spawn=0;items=[];player=400;combo=0;keys.clear();hud.status.textContent='Gas! Tangkap bintang dan hindari meteor.';hud.start.textContent='Ulangi';hud.pause.textContent='Pause';hud.pause.setAttribute('aria-pressed','false');updateHud();}
function updateHud(){hud.score.textContent=score;hud.lives.textContent='♥ '.repeat(lives).trim()||'—';hud.time.textContent=Math.max(0,Math.ceil(CONFIG.duration-elapsed));hud.best.textContent=best;hud.combo.textContent='x'+Math.max(1,Math.min(5,1+Math.floor(combo/4)));}
function endGame(){running=false;paused=false;keys.clear();if(score>best){best=score;localStorage.setItem('starCatcherBest',best);}updateHud();hud.status.textContent='Permainan selesai! Skor akhir: '+score+'. Coba pecahkan rekor!';}
function togglePause(){
 if(!running){
   hud.status.textContent='Mulai permainan dulu sebelum menggunakan Pause.';
   return;
 }
 paused=!paused;
 keys.clear();
 hud.pause.textContent=paused?'Lanjutkan':'Pause';
 hud.pause.setAttribute('aria-pressed',String(paused));
 hud.status.textContent=paused?'Permainan dijeda. Klik Lanjutkan atau tekan P.':'Permainan dilanjutkan!';
}
function step(dt){if(!running||paused)return;elapsed+=dt;spawn+=dt;
 player+=((keys.has('right')?1:0)-(keys.has('left')?1:0))*CONFIG.speed*dt;player=Math.max(42,Math.min(758,player));
 const interval=Math.max(.28,CONFIG.spawnEvery-elapsed*.003);
 if(spawn>=interval){spawn=0;const meteor=Math.random()<Math.min(.42,CONFIG.meteorChance+elapsed*.002);items.push({x:25+Math.random()*750,y:-30,meteor,gold:!meteor&&Math.random()<.13,speed:130+elapsed*2.4+Math.random()*65,rot:Math.random()*6});}
 for(let i=items.length-1;i>=0;i--){let a=items[i];a.y+=a.speed*dt;a.rot+=dt*2;
 if(a.y>=374&&a.y<=422&&Math.abs(a.x-player)<48){
   if(a.meteor){lives--;combo=0;hud.status.textContent='Aduh! Terkena meteor.';}
   else{combo++;const multiplier=Math.min(5,1+Math.floor((combo-1)/4));const points=a.gold?50:CONFIG.starScore;score+=points*multiplier;hud.status.textContent=a.gold?'Bintang emas! +'+(points*multiplier):'Nice! +'+(points*multiplier)+' poin';}
   items.splice(i,1);
 }else if(a.y>480)items.splice(i,1);}
 stars.forEach(s=>{s.y+=s.s*dt*12;if(s.y>450){s.y=0;s.x=Math.random()*800;}});
 updateHud();if(lives<=0||elapsed>=CONFIG.duration)endGame();
}
function draw(){ctx.clearRect(0,0,800,450);
 const bg=ctx.createLinearGradient(0,0,0,450);bg.addColorStop(0,'#071426');bg.addColorStop(1,'#142c4b');ctx.fillStyle=bg;ctx.fillRect(0,0,800,450);
 for(const s of stars){ctx.fillStyle='rgba(190,225,255,.75)';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle='#10243a';ctx.fillRect(0,420,800,30);ctx.strokeStyle='rgba(95,190,220,.2)';ctx.beginPath();ctx.moveTo(0,420);ctx.lineTo(800,420);ctx.stroke();
 for(const a of items){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot);
 if(a.meteor){ctx.fillStyle='#ed765f';ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9d484c';ctx.beginPath();ctx.arc(-5,-4,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,145,100,.5)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-15,-13);ctx.lineTo(-30,-28);ctx.stroke();}
 else{ctx.shadowColor=a.gold?'#fff08a':'#ffd45c';ctx.shadowBlur=18;if(starImage.complete&&starImage.naturalWidth)ctx.drawImage(starImage,-19,-19,38,38);else{ctx.fillStyle='#ffd45c';ctx.font='34px serif';ctx.fillText('★',-15,12);}if(a.gold){ctx.fillStyle='#fff5a8';ctx.font='10px sans-serif';ctx.fillText('GOLD',-13,30);}}
 ctx.restore();}
 // Player spaceship
 ctx.save();ctx.translate(player,0);ctx.shadowColor='#52e9ef';ctx.shadowBlur=18;ctx.fillStyle='#56dfe5';ctx.beginPath();ctx.moveTo(0,378);ctx.lineTo(39,414);ctx.lineTo(18,410);ctx.lineTo(0,420);ctx.lineTo(-18,410);ctx.lineTo(-39,414);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#d9ffff';ctx.beginPath();ctx.ellipse(0,398,9,13,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f7bd58';ctx.beginPath();ctx.moveTo(-10,415);ctx.lineTo(0,438+Math.random()*5);ctx.lineTo(10,415);ctx.fill();ctx.restore();
 if(!running||paused){ctx.fillStyle='rgba(3,12,25,.76)';ctx.fillRect(150,145,500,145);ctx.textAlign='center';ctx.fillStyle='#ffd36b';ctx.font='bold 29px system-ui';ctx.fillText(paused?'PAUSED':(elapsed?'MISSION COMPLETE':'COSMIC RUSH'),400,195);ctx.fillStyle='#e6f3ff';ctx.font='18px system-ui';ctx.fillText(paused?'Tekan P atau Lanjut':(elapsed?'Skor akhir: '+score:'Tangkap bintang untuk mencetak skor'),400,235);if(!elapsed&&!paused)ctx.fillText('Hindari meteor merah!',400,263);}
}
function frame(now){let dt=Math.min((now-last)/1000||0,.035);last=now;step(dt);draw();requestAnimationFrame(frame);}
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','a','A','d','D','Enter','p','P'].includes(e.key))e.preventDefault();if(e.key==='Enter'){if(!e.repeat)startGame();return;}if(e.key==='p'||e.key==='P'){if(!e.repeat)togglePause();return;}if(['ArrowLeft','a','A'].includes(e.key))keys.add('left');if(['ArrowRight','d','D'].includes(e.key))keys.add('right');});
window.addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.delete('left');if(['ArrowRight','d','D'].includes(e.key))keys.delete('right');});window.addEventListener('blur',()=>keys.clear());
for(const side of ['left','right']){const b=document.querySelector('#'+side);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(side);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(side));}
hud.start.addEventListener('click',startGame);
hud.pause.addEventListener('click',togglePause);
requestAnimationFrame(frame);
