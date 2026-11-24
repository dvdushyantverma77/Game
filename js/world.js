import * as THREE from 'three';
import {clamp} from './physics.js';
const mat=(c,roughness=.68,metalness=.06)=>new THREE.MeshStandardMaterial({color:c,roughness,metalness});
const rand=(n)=>{let x=Math.sin(n*721.23+78.3)*43758.545;return x-Math.floor(x);};
function block(parent,w,h,d,color,x,y,z,metal=.1){let o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,.5,metal));o.position.set(x,y,z);parent.add(o);return o;}
function cylinder(parent,r,h,color,x,y,z,segments=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat(color));o.position.set(x,y,z);parent.add(o);return o;}
function textSprite(text,color='#ffffff'){
 const cnv=document.createElement('canvas');cnv.width=512;cnv.height=128;const ctx=cnv.getContext('2d');ctx.fillStyle='rgba(9,15,29,.8)';ctx.beginPath();ctx.roundRect(10,15,492,100,24);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=7;ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 65px Arial';ctx.fillText(text.slice(0,16),256,91,470);let tex=new THREE.CanvasTexture(cnv);tex.colorSpace=THREE.SRGBColorSpace;let s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(2.75,.69,1);return s;
}
export function makeCar(name,color,withName=true){
 const g=new THREE.Group(),body=mat(color,.27,.65),glass=mat(0x132e45,.12,.18),dark=mat(0x141b25,.8),shine=mat(0xe4e9f6,.22,.6);
 block(g,1.9,.46,3.9,color,0,.63,0,.6);
 block(g,1.63,.38,2.1,color,0,1.01,-.22,.6);
 const windshield=block(g,1.48,.08,.78,0x112838,0,1.24,.27,.3);windshield.rotation.x=.28;
 block(g,1.45,.08,.55,0x112838,0,1.24,-1.06,.3);
 block(g,1.78,.08,.35,0x111823,0,1.04,1.82);
 for(const sx of [-1,1]){
   for(const sz of [-1.28,1.28]){
     const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.27,12),dark);w.rotation.z=Math.PI/2;w.position.set(sx*1.0,.43,sz);g.add(w);
     const hub=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.285,10),shine);hub.rotation.z=Math.PI/2;hub.position.copy(w.position);g.add(hub);
   }
   block(g,.32,.13,.2,0xf7f5d6,sx*.66,.69,-1.94);
   block(g,.33,.13,.13,0xff2a2c,sx*.68,.72,1.96);
   block(g,.12,.1,2.1,0xefffff,sx*.79,.88,.2);
   block(g,.22,.2,.65,color,sx*1.03,1.03,-.28);
 }
 block(g,1.68,.11,.18,0x121622,0,.98,1.85);
 block(g,.48,.12,3.2,0x121622,0,.87,0);
 if(withName){const sprite=textSprite(name);sprite.position.set(0,2.27,.1);g.add(sprite);}
 g.userData.bodyMaterial=body;return g;
}
function addTree(group,x,z,style,i){
 if(style==='neon'){
  const h=5+rand(i)*10;block(group,2.5,h,2.5,i%2?0x12213a:0x182f45,x,h/2-.3,z);
  for(let j=0;j<4;j++)block(group,1.95,.11,.035,j%2?0x41f0e5:0xff5ab6,x,1.3+j*(h-1.4)/4,z+1.28);
 } else if(style==='desert'){
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1.2+rand(i)*1.8,0),mat(i%2?0xad5a31:0xdd924e));rock.position.set(x,0.5,z);rock.scale.set(1.8,.85,1);group.add(rock);
 }else{
  cylinder(group,.17,2.8,0x7a4b2b,x,1.3,z);
  for(let j=0;j<4;j++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(1.25-j*.15,2.3,6),mat(0x247d56));leaf.position.set(x,2.6+j*.55,z);group.add(leaf);}
 }
}
export class World{
 constructor(canvas){this.renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',alpha:false});this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.45;this.renderer.shadowMap.enabled=false;this.renderer.setScissorTest(true);this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(66,1,.1,450);this.staticObjects=[];this.cars=[];this.ai=[];this.quality='adaptive';this.scale=.85;this.lastWidth=0;this.lastHeight=0;this.build('coast');}
 clear(){while(this.scene.children.length){const node=this.scene.children[0];this.scene.remove(node);node.traverse?.(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){for(const material of Array.isArray(obj.material)?obj.material:[obj.material]){if(material.map)material.map.dispose();material.dispose();}}});}this.staticObjects=[];this.cars=[];this.ai=[];}
 build(theme){this.clear();this.theme=theme;const opts={coast:{sky:0x7eacc2,fog:0x93acbb,ground:0x2b6955,road:0x303b49},neon:{sky:0x09132d,fog:0x152c43,ground:0x141a31,road:0x263142},desert:{sky:0xe1a977,fog:0xeabf8f,ground:0xb77849,road:0x4f4744}}[theme];this.scene.background=new THREE.Color(opts.sky);this.scene.fog=new THREE.Fog(opts.fog,68,265);
 const hemi=new THREE.HemisphereLight(0xdceeff,0x38536e,2.8);this.scene.add(hemi);const sun=new THREE.DirectionalLight(theme==='neon'?0xb6c7ff:0xffe3bf,2.5);sun.position.set(-18,40,-50);this.scene.add(sun);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,560),mat(opts.ground));ground.rotation.x=-Math.PI/2;ground.position.set(0,-.08,-170);this.scene.add(ground);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(13.6,390),mat(opts.road,.93));road.rotation.x=-Math.PI/2;road.position.set(0,.008,-164);this.scene.add(road);
 for(const x of [-6.48,6.48]){const edge=block(this.scene,.16,.03,390,theme==='neon'?0x57eaff:0xf5ede0,x,.038,-164);edge.material.emissive=new THREE.Color(theme==='neon'?0x0b617d:0x131109);}
 this.stripes=[];for(let j=0;j<19;j++)for(let side of [-1,1]){const stripe=block(this.scene,.15,.018,6,theme==='neon'?0x54dac8:0xe8debe,side*2.17,.043,-j*20+12);this.stripes.push({mesh:stripe,base:j*20});}
 for(let i=0;i<30;i++){const z=16-i*11;for(let s of [-1,1]){const g=new THREE.Group();g.position.set(s*(10+rand(i*3)*12),0,z);addTree(g,0,0,theme,i+s*3);this.scene.add(g);this.staticObjects.push({group:g,base:i*11,side:s});if(i%3===0){const rail=block(g,.2,.7,5,theme==='neon'?0x4ee3d1:0xc4b2a0,-s*3,.5,0);if(theme==='neon')rail.material.emissive=new THREE.Color(0x0e625d);}}}
 if(theme!=='neon'){for(let i=0;i<9;i++){const geo=new THREE.ConeGeometry(14+rand(i)*15,25+rand(i+4)*35,5);const peak=new THREE.Mesh(geo,mat(theme==='desert'?0x98634c:0x527884));peak.position.set((i-4)*38,-2,-175-i*3);this.scene.add(peak);}}
 if(theme==='neon'){const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(14,16,10),new THREE.MeshBasicMaterial({color:0x9b67d7}));sunDisc.position.set(-65,49,-195);this.scene.add(sunDisc);}else{const disc=new THREE.Mesh(new THREE.SphereGeometry(18,16,10),new THREE.MeshBasicMaterial({color:theme==='desert'?0xffdc9d:0xffc58e}));disc.position.set(-74,64,-220);this.scene.add(disc);}
 }
 setPlayers(racers,traffic){for(let obj of [...this.cars,...this.ai]){this.scene.remove(obj);obj.traverse(o=>{if(o.material?.map)o.material.map.dispose();if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});}this.cars=racers.map(r=>{let c=makeCar(r.name,r.color);this.scene.add(c);return c;});this.ai=traffic.map(t=>{let c=makeCar('',t.color,false);this.scene.add(c);return c;});}
 setQuality(q){this.quality=q;if(q==='low')this.scale=.62;else if(q==='high')this.scale=1;else this.scale=.85;this.resize(true);}
 resize(force=false){const w=Math.max(1,window.innerWidth),h=Math.max(1,window.innerHeight);if(!force&&w===this.lastWidth&&h===this.lastHeight)return;this.lastWidth=w;this.lastHeight=h;const dpr=Math.min(window.devicePixelRatio||1,1.6);this.renderer.setPixelRatio(dpr*this.scale);this.renderer.setSize(w,h,false);}
 adjustQuality(fps){if(this.quality!=='adaptive')return;const prev=this.scale;if(fps<27)this.scale=clamp(this.scale-.08,.5,1);else if(fps>53)this.scale=clamp(this.scale+.035,.5,1);if(Math.abs(prev-this.scale)>.01)this.resize(true);}
 updateScenery(distance){for(const s of this.staticObjects){const shift=(distance*.64)%330;s.group.position.z=16-s.base+shift;if(s.group.position.z>20)s.group.position.z-=330;}
 for(const s of this.stripes){let z=13-s.base+(distance%380);if(z>18)z-=380;s.mesh.position.z=z;}}
 render(racers,traffic,elapsed){this.resize();const w=this.lastWidth,h=this.lastHeight;const split=racers.length===2;
 for(let k=0;k<racers.length;k++){
  const racer=racers[k],vY=split?(k===0?Math.floor(h/2):0):0,vH=split?Math.ceil(h/2):h;
  this.renderer.setViewport(0,vY,w,vH);this.renderer.setScissor(0,vY,w,vH);
  this.camera.aspect=w/vH;this.camera.fov=split?74:65;this.camera.updateProjectionMatrix();this.camera.position.set(racer.x*.5,split?6.9:5.8,split?19:17);this.camera.lookAt(racer.x*.57,1,-30);
  this.updateScenery(racer.distance);this.cars.forEach((c,i)=>{c.visible=i===k;if(i===k){c.position.set(racer.x,.18,8);c.rotation.z=-racer.steer*.075;c.rotation.y=-racer.steer*.09;}});
  this.ai.forEach((car,i)=>{const t=traffic[i];const delta=t.start+t.speed*elapsed-racer.distance;const repeating=((delta+10)%400+400)%400-10;car.visible=repeating<190&&repeating>2;car.position.set(t.x,.18,8-repeating);});
  this.renderer.render(this.scene,this.camera);
 }
 }
 dispose(){this.clear();this.renderer.dispose();}
}
