import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
/** The check-in shows one question at a time: answer each, NEXT through, stop on the last. */
async function answerCheckIn(scope:{getByRole:(r:'radio'|'button',o?:{name?:string|RegExp,exact?:boolean})=>{first:()=>{click:()=>Promise<void>},click:()=>Promise<void>,count:()=>Promise<number>}},labels:string[]=[]){
 for(let i=0;;i++){const wanted=labels[i];const radio=wanted?scope.getByRole('radio',{name:wanted}):scope.getByRole('radio').first();await radio.click();
  const next=scope.getByRole('button',{name:'NEXT',exact:true});if(!await next.count())return;await next.click();}}
test.beforeEach(async({page})=>{await page.addInitScript(()=>{sessionStorage.setItem('gamify-life:booted','true');});});
async function guest(page:import('@playwright/test').Page){
 await page.goto('/');
 await page.getByRole('button',{name:'CONTINUE AS GUEST'}).click();
 await page.getByRole('button',{name:'BEGIN GUEST SESSION'}).click();
}
test('skip, pick, check in and triage the kit, earning nothing on the way',async({page})=>{
 await guest(page);
 await expect(page.getByText('1 / 4')).toBeVisible();
 await page.getByRole('button',{name:'SKIP FOR NOW'}).click();
 // 2 — hobbies
 await expect(page.getByText('2 / 4')).toBeVisible();
 const profile=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).profile);
 expect(profile.characterSkipped).toBe(true);
 expect(profile.characterTint).not.toBeNull();
 await page.getByRole('button',{name:/Reading/}).click();
 await page.getByRole('button',{name:'CONTINUE',exact:true}).click();
 // 3 — placement, which must award nothing
 await expect(page.getByText('3 / 4')).toBeVisible();
 await answerCheckIn(page);
 await page.getByRole('button',{name:'CONTINUE',exact:true}).click();
 // 4 — start kit. Wait for the step to advance before reading storage: the command is async and
 // reading straight after the click races the write.
 await expect(page.getByText('4 / 4')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).placements.reading?.level)).toBeDefined();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).ledger)).toEqual([]);
 await expect(page.getByText(/to sort out first/)).toBeVisible();
 // Reading's required kit is a library card you have and a book you borrow.
 await page.getByRole('group',{name:'Library card status'}).getByRole('button',{name:'Owned',exact:true}).click();
 await expect(page.getByText(/to sort out first/)).toBeVisible();
 await page.getByRole('group',{name:'A book status'}).getByRole('button',{name:'Borrow',exact:true}).click();
 await expect(page.getByText('You can start today.')).toBeVisible();
 await page.getByRole('button',{name:'OPEN MY DESKTOP'}).click();
 await expect(page).toHaveURL(/\/home$/);
 const final=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!));
 expect(final.ledger).toEqual([]);
 expect(final.gear['reading-0']).toBe('owned');expect(final.gear['reading-1']).toBe('borrowing');
 await expect(page.locator('.customize-nudge')).toBeVisible();
});
test('every step after the character is skippable',async({page})=>{
 await guest(page);
 await page.getByRole('button',{name:'SKIP FOR NOW'}).click();
 await page.getByRole('button',{name:/Drawing/}).click();
 await page.getByRole('button',{name:'CONTINUE',exact:true}).click();
 await page.getByRole('button',{name:'SKIP THIS STEP'}).click();
 await expect(page.getByText('4 / 4')).toBeVisible();
 await page.getByRole('button',{name:'SKIP THIS STEP'}).click();
 await expect(page).toHaveURL(/\/home$/);
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).ledger)).toEqual([]);
});
test('retaking the check-in from a hobby map prefills, saves a new suggestion, earns nothing and cancel changes nothing',async({page})=>{
 const {initialState}=await import('../../lib/domain');const {applyCommand}=await import('../../lib/progression');
 let s=initialState();s.profile.onboardingComplete=true;s.profile.characterCreated=true;s=applyCommand(s,{type:'enroll',hobbyIds:['running']}).state;s=applyCommand(s,{type:'placement',hobbyId:'running',answers:{'run-freq':1},skipped:false}).state;
 await page.addInitScript(s=>{sessionStorage.setItem('gamify-life:guest-active','true');if(!sessionStorage.getItem('gamify-life:v1'))sessionStorage.setItem('gamify-life:v1',JSON.stringify(s));},s);
 const saved=()=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!));
 await page.goto('/hobbies/running');const open=page.getByRole('button',{name:/Retake check-in/});await expect(open).toContainText('Suggested start: start');
 await open.click();const dialog=page.getByRole('dialog');await expect(dialog.getByRole('radio',{name:'Once or twice'}).first()).toBeChecked();
 await dialog.getByRole('radio',{name:'Several times a week'}).click();await dialog.getByRole('button',{name:'CANCEL'}).click();await expect(dialog).toHaveCount(0);
 expect((await saved()).placements.running.answers).toEqual({'run-freq':1});
 await open.click();await answerCheckIn(dialog,['Several times a week','Six miles or more','Well over half an hour','Running shoes I use often','In the last week or two']);
 await dialog.getByRole('button',{name:'SAVE CHECK-IN'}).click();await expect(dialog).toHaveCount(0);
 await expect.poll(async()=>(await saved()).placements.running.level).toBe(3);await expect(open).toContainText('Suggested start: advanced');
 const after=await saved();expect(after.ledger).toEqual([]);expect(Object.keys(after.progress)).toEqual([]);
});
test('every onboarding step and the check-in dialog pass an accessibility audit',async({page})=>{
 test.setTimeout(90000);const audit=async(step:string)=>{const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(r.violations.filter(v=>['serious','critical'].includes(v.impact||'')).map(v=>({step,id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);};
 await guest(page);await expect(page.getByText('1 / 4')).toBeVisible();await audit('character');
 await page.getByRole('button',{name:'SKIP FOR NOW'}).click();await expect(page.getByText('2 / 4')).toBeVisible();await page.getByRole('button',{name:/Cycling/}).click();await audit('hobbies');
 await page.getByRole('button',{name:'CONTINUE',exact:true}).click();await expect(page.getByText('3 / 4')).toBeVisible();await page.getByRole('radio').first().click();await audit('check-in');await answerCheckIn(page);
 await page.getByRole('button',{name:'CONTINUE',exact:true}).click();await expect(page.getByText('4 / 4')).toBeVisible();await page.getByRole('button',{name:'Borrow',exact:true}).first().click();await audit('start kit');
 await page.getByRole('button',{name:'OPEN MY DESKTOP'}).click();await expect(page).toHaveURL(/\/home$/);
 await page.goto('/hobbies/cycling');await page.getByRole('button',{name:/check-in/i}).click();await expect(page.getByRole('dialog')).toBeVisible();await audit('retake dialog');
});
