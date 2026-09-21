import {test,expect} from '@playwright/test';
import {initialState,type State} from '../../lib/domain';
import {applyCommand} from '../../lib/progression';
/** Four journaling nodes (plus the achievements they trigger) leave the player on 170 XP at life
 * level 1; completing jou-daily crosses 250 and reaches level 2. */
function seeded():State{
 let s=applyCommand(initialState(),{type:'enroll',hobbyIds:['journaling']}).state;
 s.profile.onboardingComplete=true;
 for(const nodeId of ['jou-start','jou-tools','jou-first','jou-friction'])
  s=applyCommand(s,{type:'complete',nodeId,evidence:{confirmed:true,note:'done',value:999,confidence:3}}).state;
 return s;
}
test.beforeEach(async({page})=>{await page.addInitScript(s=>{sessionStorage.setItem('gamify-life:guest-active','true');sessionStorage.setItem('gamify-life:booted','true');sessionStorage.setItem('gamify-life:v1',JSON.stringify(s));},seeded());});
test('the completion dialog carries the whole reward, and raises no toast behind itself',async({page})=>{
 await page.goto('/hobbies/journaling/nodes/jou-daily');
 await page.getByLabel(/reflection|completion note/i).fill('Wrote three pages.');
 await page.getByRole('checkbox',{name:/completed this challenge in real life/}).check();
 await page.getByRole('button',{name:'COMPLETE QUEST'}).click();
 const dialog=page.getByRole('dialog');
 await expect(dialog.getByRole('heading',{name:'+125 XP'})).toBeVisible();
 await expect(dialog).toContainText('Life level 2');
 await expect(dialog).toContainText('Real-World Action');
 // The dialog says it all; a toast underneath its overlay would be unreachable as well as redundant.
 await expect(page.locator('.reward-toast')).toHaveCount(0);
});
test('logging practice keeps its XP in the dialog and raises no empty toast',async({page})=>{
 await page.goto('/hobbies/journaling/nodes/jou-first');
 await page.getByRole('button',{name:'Log another practice'}).click();
 const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Minutes practiced').fill('20');
 await dialog.getByLabel('Private reflection (optional)').fill('Twenty quiet minutes.');
 await dialog.getByRole('checkbox',{name:/practiced safely/}).check();
 await dialog.getByRole('button',{name:'Save practice'}).click();
 await expect(dialog.getByRole('status')).toContainText('+20 XP');
 await expect(page.locator('.reward-toast')).toHaveCount(0);
});

/** Six journaling nodes leave the hobby on 295 XP; a 20-minute practice crosses 300 and reaches
 * journaling level 2. The practice dialog reports the XP, so the toast carries only the level. */
test('a level-up reached through practice is announced even though the dialog owns the XP',async({page})=>{
 await page.addInitScript(s=>sessionStorage.setItem('gamify-life:v1',JSON.stringify(s)),(()=>{
  let s=seeded();
  for(const nodeId of ['jou-daily','jou-reflect'])
   s=applyCommand(s,{type:'complete',nodeId,evidence:{confirmed:true,note:'done',value:999,confidence:3}}).state;
  return s;})());
 await page.goto('/hobbies/journaling/nodes/jou-first');
 await page.getByRole('button',{name:'Log another practice'}).click();
 const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Minutes practiced').fill('20');
 await dialog.getByLabel('Private reflection (optional)').fill('Twenty quiet minutes.');
 await dialog.getByRole('checkbox',{name:/practiced safely/}).check();
 await dialog.getByRole('button',{name:'Save practice'}).click();
 const toast=page.locator('.reward-toast');
 await expect(toast).toContainText('Journaling level 2');
 await expect(toast).not.toContainText('XP');
 await expect(dialog.getByRole('status')).toContainText('+20 XP');
});
