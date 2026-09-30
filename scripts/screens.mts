/** Screenshots every surface at phone and desktop width against a running dev server.
 * Usage: `tsx scripts/screens.mts before` (or `after`) with `pnpm dev` on :3000. */
import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {initialState} from '../lib/domain';
const out=`docs/design/screens/${process.argv[2]||'before'}`;mkdirSync(out,{recursive:true});
const done=initialState();done.profile.onboardingComplete=true;done.profile.characterCreated=true;done.enrollments=['tennis','cycling','swimming','journaling'];
type Shot={name:string;path:string;state?:object;booted?:boolean;guest?:boolean};
const shots:Shot[]=[
 {name:'boot',path:'/',booted:false,guest:false},
 {name:'login',path:'/',guest:false},
 {name:'setup',path:'/',state:initialState()},
 {name:'home',path:'/home'},
 {name:'hobbies',path:'/hobbies'},
 {name:'tree',path:'/hobbies/tennis'},
 {name:'week',path:'/hobbies/tennis/week'},
 {name:'gear',path:'/hobbies/tennis/gear'},
 {name:'node',path:'/hobbies/journaling/nodes/jou-first'},
 {name:'character',path:'/character'},
 {name:'appearance',path:'/character/appearance/top'},
 {name:'settings',path:'/settings'},
 {name:'sign-up',path:'/auth/sign-up',guest:false},
 {name:'not-found',path:'/no-such-page'},
];
// GPU flags: without a GPU the wallpaper falls back to its CSS gradient (components/scene-wallpaper.tsx)
const browser=await chromium.launch({args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
for(const [w,h] of [[375,812],[1280,800]])for(const s of shots){
 const page=await browser.newPage({viewport:{width:w,height:h},reducedMotion:'reduce'});
 await page.addInitScript(({booted,guest,state})=>{if(booted)sessionStorage.setItem('gamify-life:booted','true');if(guest){sessionStorage.setItem('gamify-life:guest-active','true');sessionStorage.setItem('gamify-life:v1',JSON.stringify(state));}},{booted:s.booted??true,guest:s.guest??true,state:s.state??done});
 // reducedMotion skips the boot screen, so the boot shot runs with motion allowed
 if(s.name==='boot')await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`http://127.0.0.1:3000${s.path}`);await page.waitForTimeout(s.name==='boot'?300:2500);
 await page.screenshot({path:`${out}/${s.name}-${w}.png`});await page.close();console.log(`${s.name}-${w}`);
}
await browser.close();
