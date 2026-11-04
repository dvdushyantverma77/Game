// Canvas-only pseudo-3D racing engine. No GPU-heavy dependency required.
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const TRACKS={
 coast:{name:'Azure Coast',sky:['#073b77','#70c6ed'],hill:'#35728f',ground:'#347c68',road:'#35394c',edge:'#f2d5ae',curve:1.0},
 neon:{name:'Neon City',sky:['#100a36','#6c2473'],hill:'#201c4d',ground:'#191c46',road:'#232437',edge:'#ff66b5',curve:1.35},
 desert:{name:'Golden Dunes',sky:['#75396e','#edb777'],hill:'#c4855f',ground:'#bf8257',road:'#4b4652',edge:'#ffe0a0',curve:.85}
};
export class Sound {
 constructor(){this.ctx=null;this.volume=.5;this.muted=false;this.lastEngine=0;}
 unlock(){try{if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();}catch{}}
 tone(freq=440,duration=.12,type='sine',gain=.08,slide=0){if(!this.ctx||this.volume===0)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),t+duration);g.gain.setValueAtTime(Math.max(.0001,gain*this.volume),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(c.destination);o.start(t);o.stop(t+duration+.01)}
 beep(){this.tone(540,.11,'square',.075);this.tone(700,.14,'sine',.035)}
 nitro(){this.tone(210,.45,'sawtooth',.095,700)}
 crash(){this.tone(95,.32,'sawtooth',.14,-48)}
 win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.tone(f,.28,'triangle',.11),i*160))}
 engine(speed,time){if(time-this.lastEngine<.21)return;this.lastEngine=time;this.tone(85+speed*.65,.075,'triangle',.016)}
}
function randomTraffic(seed){const out=[];let x=seed|0;for(let n=0;n<48;n++){x=(1664525*x+1013904223)>>>0;const lane=(x%5-2)*.32;x=(1664525*x+1013904223)>>>0;out.push({z:180+n*130+(x%55),lane,speed:32+(x%34),color:['#ffe06f','#e3e8f9','#ad74ff','#f66b77'][n%4],hit:false})}return out}
export class Race {
 constructor({mode='solo',driver='Moksha',track='coast',quality='balanced'}={}){
  this.mode=mode;this.driver=driver;this.track=track;this.quality=quality;this.state='countdown';this.countdown=3.5;this.t=0;this.raceLength=5000;this.players=(mode==='duo'?['Moksha','Duvi']:[driver]).map((name,i)=>({name,position:0,lane:0,steer:0,speed:0,boost:80,score:0,crashes:0,finishAt:null,flash:0,color:name==='Moksha'?'#18d9ff':'#ff5e9d',control:{steer:0,gas:false,brake:false,nitro:false},ai:randomTraffic(100+i*99)}));this.rivals=randomTraffic(373);this.winner=null;this.cameraX=0;
 }
 setControl(i,data){const p=this.players[i];if(p)p.control={...p.control,...data}}
 tick(dt,sound){if(this.state==='paused'||this.state==='results')return;dt=clamp(dt,0,.045);this.t+=dt;
 if(this.state==='countdown'){const before=Math.ceil(this.countdown);this.countdown-=dt;if(Math.ceil(Math.max(0,this.countdown))!==before)sound?.beep();if(this.countdown<=0)this.state='racing';return}
 for(const p of this.players){if(p.finishAt!==null)continue;const c=p.control;const target=clamp(c.steer,-1,1);p.steer=lerp(p.steer,target,Math.min(1,dt*9));
 const accelerate=c.gas?65:0;const brake=c.brake?125:0;const nitro=c.nitro&&c.gas&&p.boost>0;
 p.speed=clamp(p.speed+(accelerate-brake-10-p.speed*.07+(nitro?115:0))*dt,0,nitro?205:155);
 p.boost=clamp(p.boost+(nitro?-35:10)*dt,0,100);p.lane=clamp(p.lane+p.steer*dt*(.8+p.speed/120),-1.45,1.45);
 if(Math.abs(p.lane)>1.06){p.speed=Math.max(30,p.speed-65*dt)}
 p.position+=p.speed*dt;p.score=Math.round(p.position*.17)+Math.round(p.boost*.1)-p.crashes*40;p.flash=Math.max(0,p.flash-dt);
 for(const car of p.ai){const relative=car.z+car.speed*this.t-p.position;if(!car.hit&&relative>0&&relative<7&&Math.abs(car.lane-p.lane)<.28){car.hit=true;p.speed*=.48;p.flash=.65;p.crashes++;sound?.crash()}}
 if(p.position>=this.raceLength){p.position=this.raceLength;p.finishAt=this.t;p.speed=0;if(!this.winner)this.winner=p.name;sound?.win()}
 }
 if(this.players.every(p=>p.finishAt!==null)){this.state='results'}
 // In solo mode a computer finishes eventually too; leaderboard uses current progress.
 sound?.engine(Math.max(...this.players.map(p=>p.speed)),this.t)
 }
 togglePause(){if(this.state==='racing'||this.state==='countdown')this.state='paused';else if(this.state==='paused')this.state='racing'}
}
const rounded=(c,x,y,w,h,r,fill)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
function polygon(c,pts,fill){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fillStyle=fill;c.fill()}
function carSprite(c,x,y,size,color,name,shadow=true){const w=size,h=size*1.55;c.save();c.translate(x,y);if(shadow){c.fillStyle='#0007';c.beginPath();c.ellipse(0,0,w*.61,h*.14,0,0,Math.PI*2);c.fill()}rounded(c,-w*.57,-h*.36,w*.20,h*.68,4,'#080e1d');rounded(c,w*.37,-h*.36,w*.20,h*.68,4,'#080e1d');polygon(c,[[-w*.48,0],[-w*.43,-h*.70],[w*.43,-h*.70],[w*.48,0],[w*.46,h*.04],[-w*.46,h*.04]],color);polygon(c,[[-w*.36,-h*.50],[-w*.23,-h*.67],[w*.23,-h*.67],[w*.36,-h*.50],[w*.30,-h*.28],[-w*.30,-h*.28]],'#0b183a');rounded(c,-w*.42,-h*.11,w*.84,h*.14,3,'#ffffff33');rounded(c,-w*.40,-h*.05,w*.19,h*.12,2,'#ff4256');rounded(c,w*.21,-h*.05,w*.19,h*.12,2,'#ff4256');c.textAlign='center';c.lineWidth=Math.max(2,size*.04);c.strokeStyle='#06172d';c.font=`900 ${Math.max(10,size*.20)}px system-ui`;c.strokeText(name,0,-h*.17);c.fillStyle='#fff';c.fillText(name,0,-h*.17);c.restore()}
function horizonCurve(z,track){return (Math.sin(z/420)+.4*Math.sin(z/1300))*track.curve*.22}
function racingScene(c,v,p,race,quality,now){const {x,y,w,h}=v;const track=TRACKS[race.track],hz=y+h*.40;const sky=c.createLinearGradient(0,y,0,hz);sky.addColorStop(0,track.sky[0]);sky.addColorStop(1,track.sky[1]);c.fillStyle=sky;c.fillRect(x,y,w,h*.46);c.fillStyle=track.hill;c.beginPath();c.moveTo(x,hz);for(let i=0;i<=20;i++){const px=x+w*i/20,py=hz-20-Math.sin(i*.65+race.t*.04)*13-Math.cos(i*1.7)*7;c.lineTo(px,py)}c.lineTo(x+w,hz+30);c.closePath();c.fill();c.fillStyle=track.ground;c.fillRect(x,hz,w,y+h-hz);
 if(race.track==='neon'){for(let i=0;i<20;i++){const px=x+i/20*w,bh=(17+(i*17)%52)*h/420;c.fillStyle=i%2?'#12142e':'#20183f';c.fillRect(px,hz-bh,Math.ceil(w/20),bh);if(i%2)c.fillStyle='#e65ba6',c.fillRect(px+4,hz-bh+6,3,5)}}
 const rows=quality==='low'?45:quality==='high'?94:66;
 const bend=horizonCurve(p.position+340,track);const roadW=w*.72,roadCenter=x+w/2-p.lane*w*.21;
 const roadPoint=(depth)=>{const depth2=Math.pow(depth,1.75);const zz=p.position+depth2*900;const curve=horizonCurve(zz,track)-bend;return {Y:y+h-(h*.61)*depth,cx:roadCenter+curve*w*.40,hw:roadW*.5*(1-depth*.88),depth}};
 for(let i=rows-1;i>=0;i--){const near=roadPoint(i/rows),far=roadPoint((i+1)/rows);polygon(c,[[near.cx-near.hw*1.11,near.Y],[near.cx+near.hw*1.11,near.Y],[far.cx+far.hw*1.11,far.Y],[far.cx-far.hw*1.11,far.Y]],Math.floor((p.position/85+i)/4)%2===0?track.edge:'#d64d52');polygon(c,[[near.cx-near.hw,near.Y],[near.cx+near.hw,near.Y],[far.cx+far.hw,far.Y],[far.cx-far.hw,far.Y]],track.road);
 if((Math.floor((p.position/42+i)/6)%2)===0){for(const split of [-1/3,1/3]){polygon(c,[[near.cx+split*near.hw*1.9-near.hw*.013,near.Y],[near.cx+split*near.hw*1.9+near.hw*.013,near.Y],[far.cx+split*far.hw*1.9+far.hw*.013,far.Y],[far.cx+split*far.hw*1.9-far.hw*.013,far.Y]],'#fff8')}}
 }
 // Speed streaks and occasional roadside signs.
 if(quality!=='low')for(let k=0;k<9;k++){const d=((k*0.126+p.position/170)%1),q=roadPoint(d),side=k%2?-1:1,cx=q.cx+side*q.hw*1.33;c.fillStyle=race.track==='neon'?'#ff73bd':'#d9e7dc';c.fillRect(cx,q.Y-22*(1-d),2+3*(1-d),22*(1-d));}
 const visible=p.ai.map(car=>({car,rel:car.z+car.speed*race.t-p.position})).filter(o=>o.rel>12&&o.rel<900).sort((a,b)=>b.rel-a.rel);
 for(const {car,rel} of visible){const depth=clamp(rel/900,0,1),q=roadPoint(depth),sz=18+(1-depth)*w*.12;carSprite(c,q.cx+car.lane*q.hw*.72,q.Y,sz,car.color,'AI',false)}
 const ownSize=Math.min(w*.26,h*.21);carSprite(c,x+w/2+p.lane*w*.015,y+h*.86,ownSize,p.color,p.name);
 if(p.control.nitro&&p.control.gas&&p.boost>0){c.fillStyle='#64fcffb0';polygon(c,[[x+w/2-12,y+h*.92],[x+w/2-5,y+h*.98],[x+w/2,y+h*.91]],'#3dffff');polygon(c,[[x+w/2+5,y+h*.92],[x+w/2+12,y+h*.98],[x+w/2+15,y+h*.91]],'#ffbf54')}
 if(p.flash>0){c.fillStyle=`rgba(255,35,65,${p.flash*.27})`;c.fillRect(x,y,w,h)}
 // Info HUD per car
 rounded(c,x+8,y+9,Math.min(w-16,158),60,8,'#030e29bd');c.textAlign='left';c.fillStyle=p.color;c.font='900 14px system-ui';c.fillText(p.name.toUpperCase(),x+16,y+27);c.font='800 11px system-ui';c.fillStyle='#e5f9ff';c.fillText(`${Math.round(p.speed*1.6)} KM/H    ${Math.floor(p.position/2500)+1>2?2:Math.floor(p.position/2500)+1}/2 LAP`,x+16,y+42);c.fillStyle='#233854';c.fillRect(x+16,y+50,122,6);c.fillStyle='#39dafa';c.fillRect(x+16,y+50,122*p.boost/100,6);
 rounded(c,x+w-85,y+9,77,52,8,'#030e29bd');c.textAlign='center';c.font='900 11px system-ui';c.fillStyle='#ffffffbb';c.fillText('SCORE',x+w-46,y+25);c.fillStyle='#fff';c.font='900 18px system-ui';c.fillText(String(p.score),x+w-46,y+46);
 if(race.state==='countdown'){c.fillStyle='#0008';c.fillRect(x,y,w,h);c.fillStyle='#fff';c.textAlign='center';c.font=`900 ${Math.min(w*.18,80)}px system-ui`;c.fillText(race.countdown<.65?'GO!':Math.ceil(race.countdown),x+w/2,y+h*.53)}
 if(p.finishAt!==null){c.fillStyle='#0009';c.fillRect(x,y,w,h);c.fillStyle=p.color;c.font=`900 ${Math.min(w*.12,36)}px system-ui`;c.textAlign='center';c.fillText('FINISHED!',x+w/2,y+h*.47);c.fillStyle='white';c.font='800 16px system-ui';c.fillText(`${p.finishAt.toFixed(1)} sec`,x+w/2,y+h*.55)}
}
export function drawGame(canvas,race,quality='balanced'){const c=canvas.getContext('2d',{alpha:false});const w=canvas.width,h=canvas.height;if(w<2||h<2)return;const duo=race.mode==='duo';const landscape=w>=h;const regions=duo?(landscape?[{x:0,y:0,w:w/2,h},{x:w/2,y:0,w:w/2,h}]:[{x:0,y:0,w,h:h/2},{x:0,y:h/2,w,h:h/2}]):[{x:0,y:0,w,h}];regions.forEach((v,i)=>racingScene(c,v,race.players[i],race,quality,race.t));if(duo){c.strokeStyle='#e5f9ff';c.lineWidth=3;c.beginPath();if(landscape){c.moveTo(w/2,0);c.lineTo(w/2,h)}else{c.moveTo(0,h/2);c.lineTo(w,h/2)}c.stroke()}if(race.state==='paused'){c.fillStyle='#0009';c.fillRect(0,0,w,h)}}
