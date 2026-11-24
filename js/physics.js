export const LAP_METERS = 1100;
export const TOTAL_LAPS = 2;
export function clamp(x,a,b){return Math.min(b,Math.max(a,x));}
export function newRacer(name,color,index=0){return {name,color,index,x:index?1:-1,speed:0,distance:0,lap:1,nitro:100,score:0,collisions:0,finished:false,finishTime:0,steer:0,boosting:false,crashCooldown:0,time:0};}
export function stepRacer(r,control,dt){
 if(r.finished)return;
 dt=clamp(dt,0,0.045);
 const steer=clamp(control.steer||0,-1,1);
 r.steer+=(steer-r.steer)*Math.min(1,dt*9);
 const throttle=control.accel!==false;
 const braking=!!control.brake;
 const boost=!!control.nitro && r.nitro>1 && !braking && r.speed>12;
 r.boosting=boost;
 const max=boost?76:55;
 const acceleration=braking?-68:throttle?27:-23;
 r.speed=clamp(r.speed+dt*(acceleration-(r.speed*r.speed)*0.004),0,max);
 if(boost){r.speed=clamp(r.speed+dt*45,0,76);r.nitro=clamp(r.nitro-dt*24,0,100);}
 else r.nitro=clamp(r.nitro+dt*4,0,100);
 r.x=clamp(r.x+r.steer*dt*(3.3+r.speed*.073),-5.2,5.2);
 if(Math.abs(r.x)>4.8)r.speed=Math.max(10,r.speed-dt*35);
 r.distance+=r.speed*dt;
 r.time+=dt;
 r.score=Math.floor(r.distance*.35)+Math.floor(r.nitro*.1)-r.collisions*30;
 r.lap=Math.min(TOTAL_LAPS,Math.floor(r.distance/LAP_METERS)+1);
 r.crashCooldown=Math.max(0,r.crashCooldown-dt);
 if(r.distance>=LAP_METERS*TOTAL_LAPS){r.distance=LAP_METERS*TOTAL_LAPS;r.finished=true;r.finishTime=r.time;r.speed=0;r.boosting=false;}
}
export function applyCollision(r,traffic){if(r.crashCooldown>0||r.finished)return false;const delta=traffic.distance-r.distance;if(delta>-1.9 && delta<3.5 && Math.abs(r.x-traffic.x)<1.75){r.speed*=.42;r.collisions++;r.crashCooldown=1.5;r.nitro=clamp(r.nitro-9,0,100);return true;}return false;}
export function makeTraffic(){const lane=[-3.7,0,3.7,-1.9,1.9];return Array.from({length:13},(_,i)=>({id:i,x:lane[(i*7+2)%lane.length],start:130+i*149,speed:8+(i*17)%14,color:[0x49dbe2,0xf7cc67,0xcf79ff,0xe6ebf3,0x55a4fd][i%5]}));}
export function trafficAt(t,elapsed){return {x:t.x,distance:t.start+t.speed*elapsed};}
export function raceResult(racers){return [...racers].sort((a,b)=>(b.distance-a.distance)||(a.finishTime-b.finishTime))[0];}
