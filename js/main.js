import {World} from './world.js';
import {newRacer,stepRacer,makeTraffic,trafficAt,applyCollision,raceResult,LAP_METERS,TOTAL_LAPS} from './physics.js';
import {HandControls} from './hands.js';
import {Sound} from './audio.js';
const $=id=>document.getElementById(id);
const el={menu:$('menu'),cam:$('cameraPanel'),hud:$('hud'),finish:$('finish'),pause:$('pause'),start:$('startBtn'),menuBtn:$('menuBtn'),fps:$('fps'),countdown:$('countdown'),toast:$('toast'),stats:[$('stats1'),$('stats2')],touch:[$('touch1'),$('touch2')]};
let world,sound,hands,game=null,screen='menu',last=0,lastHud=0,fpsTime=0,frames=0,toastUntil=0,hold=[{},{}],keys={},countdown=0,frameRunning=true;
const notify=text=>{el.toast.textContent=text;el.toast.classList.add('visible');toastUntil=performance.now()+3000;};
const show=(section)=>{screen=section;for(const [name,node] of [['menu',el.menu],['cam',el.cam],['hud',el.hud],['finish',el.finish],['pause',el.pause]])node.classList.toggle('hidden',name!==section);el.menuBtn.hidden=section==='menu'||section==='cam';document.body.classList.toggle('racing',section==='hud'||section==='pause');document.body.classList.toggle('split',game?.racers.length===2&&(section==='hud'||section==='pause'));};
function configureMode(){$('p2label').classList.toggle('hidden',$('mode').value==='1');}
$('mode').addEventListener('change',configureMode);configureMode();
const controller=(i)=>{const touch=hold[i],cam=$('control').value==='camera'&&hands?.active;const cameraInput=cam?hands.get(i,game.racers.length===2):null;const steer=(touch.left||keys[i?'j':'a']||(!i&&keys.ArrowLeft))?-1:(touch.right||keys[i?'l':'d']||(!i&&keys.ArrowRight))?1:0;
 const brake=!!(touch.brake||keys[i?'k':'s']||(!i&&keys.ArrowDown));const nitro=!!(touch.nitro||keys[i?'i':' ']);
 if(cam&&cameraInput)return{steer:Math.abs(steer)>0?steer:cameraInput.steer,accel:cameraInput.accel,brake:brake||cameraInput.brake,nitro:nitro||cameraInput.nitro};
 if(cam&&!cameraInput)return {steer,accel:false,brake:true,nitro:false}; // lost tracking = safe brake
 return{steer,accel:true,brake,nitro};};
function stats(r){return `<b style="color:${r.index?'#ffc875':'#74eee8'}">${escapeHtml(r.name)}</b><br><strong>${Math.round(r.speed*3.6)} <small>km/h</small></strong><br><small>LAP ${r.lap}/${TOTAL_LAPS} · NITRO ${Math.round(r.nitro)}% · SCORE ${Math.max(0,r.score)}<br>${r.collisions} collisions · ${r.time.toFixed(1)}s</small>`;}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function openCam(){show('cam');if(!hands){hands=new HandControls($('camera'),$('landmarks'),$('cameraStatus'));} }
$('cameraBtn').onclick=openCam;$('enableCamera').onclick=async()=>{try{await hands.start();notify('Hand detection ready. Calibrate both players.');}catch(e){notify(e.message+' • Use Touch mode if needed.');}};
$('cal1').onclick=()=>notify(hands?.calibrate(0)?'Moksha calibration saved':'Show one hand in LEFT half of camera first');
$('cal2').onclick=()=>notify(hands?.calibrate(1)?'Duvi calibration saved':'Show one hand in RIGHT half of camera first');
$('closeCamera').onclick=()=>show('menu');
function startRace(){if($('control').value==='touch'&&hands?.active)hands.stop();sound.enabled=$('sound').value==='on';const count=$('mode').value==='2'?2:1;const names=[$('name1').value.trim()||'Moksha',$('name2').value.trim()||'Duvi'];const racers=[newRacer(names[0],0x13b9ec,0)];if(count===2)racers.push(newRacer(names[1],0xf7a53c,1));const traffic=makeTraffic();world.build($('track').value);world.setQuality($('quality').value);world.setPlayers(racers,traffic);game={racers,traffic,elapsed:0,ready:false};hold=[{},{}];countdown=3.6;lastHud=0;el.touch[1].classList.toggle('hidden',count!==2);el.touch[0].classList.toggle('hidden',$('control').value==='camera');el.touch[1].classList.toggle('hidden',count!==2||$('control').value==='camera');el.stats[1].classList.toggle('hidden',count!==2);$('trackBanner').textContent=$('track').selectedOptions[0].textContent;show('hud');sound.start();notify('Race starting! '+(count===2?'Split-screen mode':'Solo challenge'));}
$('startBtn').onclick=()=>{if($('control').value==='camera'&&!hands?.active){notify('Set up camera first, or choose Touch mode');return;}startRace();};
$('again').onclick=startRace;$('home').onclick=()=>{sound.stop();game=null;show('menu');};
$('menuBtn').onclick=()=>{if(screen==='hud'){show('pause');sound.engine(0,false);}else if(screen==='pause')show('hud');};
$('resume').onclick=()=>show('hud');$('quit').onclick=()=>{sound.stop();game=null;show('menu');};
for(let btn of document.querySelectorAll('[data-key]')){const p=+btn.dataset.p,key=btn.dataset.key;const down=e=>{e.preventDefault();hold[p][key]=true;btn.setPointerCapture?.(e.pointerId);},up=e=>{e.preventDefault();hold[p][key]=false;};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('lostpointercapture',()=>hold[p][key]=false);}
window.addEventListener('keydown',e=>{if(['INPUT','SELECT'].includes(document.activeElement?.tagName))return;keys[e.key]=true;if(['ArrowLeft','ArrowRight','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key==='Escape'&&screen==='hud')show('pause');else if(e.key==='Escape'&&screen==='pause')show('hud');});window.addEventListener('keyup',e=>{keys[e.key]=false;});
window.addEventListener('blur',()=>{hold=[{},{}];keys={};if(screen==='hud')show('pause');});document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='hud')show('pause');});
function endRace(){if(screen!=='hud')return;const win=raceResult(game.racers);$('finishTitle').textContent=game.racers.length===2?`${win.name.toUpperCase()} WINS!`:`${win.name.toUpperCase()} FINISHED!`;const ranking=[...game.racers].sort((a,b)=>b.distance-a.distance);$('finishScores').innerHTML=ranking.map((r,i)=>`${i+1}. ${escapeHtml(r.name)} — ${r.time.toFixed(1)} sec · ${Math.max(0,r.score)} pts · ${r.collisions} hits`).join('<br>');sound.blip(880,.8);sound.stop();try{const best=JSON.parse(localStorage.getItem('md_racing_best')||'{}');for(const r of game.racers){const k=$('track').value+'_'+r.name;if(r.finished&&(!best[k]||r.time<best[k]))best[k]=r.time;}localStorage.setItem('md_racing_best',JSON.stringify(best));}catch{}show('finish');}
function tick(now){if(!frameRunning)return;const dt=Math.min(.045,Math.max(0,(now-last)/1000||0));last=now;hands?.tick(now);
 if(game&&(screen==='hud'||screen==='pause')){
 if(screen==='hud'){
  if(countdown>0){countdown-=dt;el.countdown.textContent=countdown>1?String(Math.ceil(countdown)):'GO!';if(countdown<=0){el.countdown.textContent='';sound.blip(860,.28);}}
  else{
   game.elapsed+=dt;
   game.racers.forEach((r,i)=>{stepRacer(r,controller(i),dt);if(r.crashCooldown>1.46)sound.blip(170,.18);for(const t of game.traffic){if(applyCollision(r,trafficAt(t,game.elapsed))){sound.blip(125,.25);break;}}});
   sound.engine(game.racers.reduce((a,r)=>a+r.speed,0)/game.racers.length,game.racers.some(r=>r.boosting));
   if(game.racers.every(r=>r.finished)||game.elapsed>225)endRace();
  }
  if(now-lastHud>130){game.racers.forEach((r,i)=>el.stats[i].innerHTML=stats(r));lastHud=now;}
 }
 world.render(game.racers,game.traffic,game.elapsed);
 }else if(!game){world.render([demoRacer],[],0);}
 if(now>toastUntil)el.toast.classList.remove('visible');frames++;if(now-fpsTime>4000){const fps=Math.round(frames*1000/(now-fpsTime));el.fps.textContent=fps+' FPS';if(game&&screen==='hud')world.adjustQuality(fps);frames=0;fpsTime=now;}
 requestAnimationFrame(tick);
}
let demoRacer=newRacer('Moksha',0x13b9ec,0);
try{world=new World($('game'));sound=new Sound();world.setPlayers([demoRacer],[]);world.resize();fpsTime=performance.now();requestAnimationFrame(tick);}catch(e){console.error(e);el.menu.innerHTML='<h2>3D RENDERER ERROR</h2><p>'+escapeHtml(e.message||String(e))+'</p><p>Check Safari WebGL support and reload. Try another browser for testing.</p>';}
window.addEventListener('pagehide',()=>{hands?.stop();sound?.stop();});
