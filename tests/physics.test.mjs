import test from 'node:test';import assert from 'node:assert/strict';
import {newRacer,stepRacer,makeTraffic,applyCollision,raceResult,LAP_METERS,TOTAL_LAPS} from '../js/physics.js';
test('throttle moves racer and speed respects cap',()=>{const r=newRacer('Moksha',0x123);for(let i=0;i<1000;i++)stepRacer(r,{steer:0,accel:true},.016);assert.ok(r.distance>0);assert.ok(r.speed<=55);});
test('steering clamps to paved course edges',()=>{const r=newRacer('Duvi',0x123);for(let i=0;i<500;i++)stepRacer(r,{steer:1,accel:true},.016);assert.ok(r.x<=5.2);});
test('nitro depletes and recharges',()=>{const r=newRacer('A',0x123);for(let i=0;i<180;i++)stepRacer(r,{accel:true},.016);const start=r.nitro;stepRacer(r,{accel:true,nitro:true},.03);assert.ok(r.nitro<start);stepRacer(r,{accel:true},.03);assert.ok(r.nitro>start-.73);});
test('collision applies cooldown and speed loss',()=>{const r=newRacer('A',0x123);r.speed=40;r.x=0;r.distance=100;assert.equal(applyCollision(r,{x:0,distance:101}),true);assert.ok(r.speed<40);assert.equal(applyCollision(r,{x:0,distance:101}),false);});
test('two lap finish detected',()=>{const r=newRacer('A',0x123);for(let i=0;i<4000&&!r.finished;i++)stepRacer(r,{accel:true},.03);assert.ok(r.finished);assert.equal(r.distance,LAP_METERS*TOTAL_LAPS);});
test('two players and AI populated',()=>{const a=newRacer('Moksha',0,0),b=newRacer('Duvi',0,1);assert.equal(raceResult([a,b]).name,'Moksha');assert.equal(makeTraffic().length,13);});
