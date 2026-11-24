const RUNTIME='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22';
const MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class HandControls{
 constructor(video,canvas,status){this.video=video;this.canvas=canvas;this.ctx=canvas.getContext('2d');this.status=status;this.active=false;this.last=0;this.hands=[null,null];this.centers=[.25,.75];this.latest=[null,null];this.error='';this.interval=115;this.smoothing=[0,0];try{let c=JSON.parse(localStorage.getItem('md_hand_calibration')||'null');if(Array.isArray(c)&&c.length===2&&c.every(Number.isFinite))this.centers=c;}catch{}}
 async start(){if(this.active)return;this.status.textContent='Requesting camera permission…';if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera requires HTTPS (or localhost) and a supported Safari browser.');let stream=null;try{
 stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:320},height:{ideal:240},frameRate:{ideal:15,max:24}}});this.video.srcObject=stream;await this.video.play();this.stream=stream;this.status.textContent='Downloading hand-tracking model (first load may take longer)…';
 const vision=await import(RUNTIME+'/vision_bundle.mjs');const files=await vision.FilesetResolver.forVisionTasks(RUNTIME+'/wasm');
 try{this.detector=await vision.HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate:'GPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.53,minTrackingConfidence:.50});}
 catch{this.detector=await vision.HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.53,minTrackingConfidence:.50});}
 this.active=true;this.status.textContent='Tracking ready — show open palms. Move left/right to steer.';
 }catch(err){if(stream)stream.getTracks().forEach(t=>t.stop());this.video.srcObject=null;this.stream=null;this.active=false;this.status.textContent='Camera failed: '+(err?.message||String(err));throw err;}}
 stop(){this.active=false;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.video.srcObject=null;try{this.detector?.close();}catch{}this.detector=null;this.hands=[null,null];this.latest=[null,null];this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.status.textContent='Camera off';}
 interpret(points){const palm=Math.max(.07,dist(points[0],points[9]));const fingers=[[8,6],[12,10],[16,14],[20,18]];const extended=fingers.filter(([tip,pip])=>dist(points[tip],points[0])>dist(points[pip],points[0])*1.11).length;const pinch=dist(points[4],points[8])<palm*.50;return {x:1-points[9].x,y:points[9].y,palm,extended,pinch,points};}
 tick(now){if(!this.active||!this.detector||this.video.readyState<2||now-this.last<this.interval)return;this.last=now;let result;try{result=this.detector.detectForVideo(this.video,now);}catch(err){this.status.textContent='Tracking error: '+err.message;return;}
 this.latest=[null,null];for(let landmarks of result.landmarks||[]){const info=this.interpret(landmarks);const zone=info.x<.5?0:1;const prior=this.latest[zone];if(!prior||Math.abs(info.x-this.centers[zone])<Math.abs(prior.x-this.centers[zone]))this.latest[zone]=info;}
 this.hands=this.latest.map((v,i)=>{if(!v)return null;const raw=clamp((v.x-this.centers[i])/.205,-1,1);this.smoothing[i]=this.smoothing[i]*.65+raw*.35;return{steer:Math.abs(this.smoothing[i])<.09?0:this.smoothing[i],accel:v.extended>=3,brake:v.extended<=1&&!v.pinch,nitro:v.pinch&&v.extended>=1};});
 this.draw();const n=this.hands.filter(Boolean).length;this.status.textContent=n+' hand(s) tracked • '+(this.hands[0]?'Left ✓ ':'Left — ')+(this.hands[1]?'Right ✓':'Right —');
 }
 draw(){const w=this.canvas.width=320,h=this.canvas.height=240,c=this.ctx;c.clearRect(0,0,w,h);c.strokeStyle='#7cf6df';c.lineWidth=2;for(let hand of this.latest){if(!hand)continue;for(const [a,b] of [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]]){c.beginPath();c.moveTo(hand.points[a].x*w,hand.points[a].y*h);c.lineTo(hand.points[b].x*w,hand.points[b].y*h);c.stroke();}}}
 calibrate(index){const hand=this.latest[index];if(!hand)return false;this.centers[index]=hand.x;this.smoothing[index]=0;try{localStorage.setItem('md_hand_calibration',JSON.stringify(this.centers));}catch{}return true;}
 get(index,two){if(two)return this.hands[index];return this.hands[0]||this.hands[1];}
}
