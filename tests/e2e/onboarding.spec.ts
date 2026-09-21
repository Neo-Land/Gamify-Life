import {test,expect} from '@playwright/test';
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
 await page.getByRole('radio').first().check();
 await page.getByRole('button',{name:'CONTINUE',exact:true}).click();
 // 4 — start kit. Wait for the step to advance before reading storage: the command is async and
 // reading straight after the click races the write.
 await expect(page.getByText('4 / 4')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).placements.reading?.level)).toBeDefined();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).ledger)).toEqual([]);
 await expect(page.getByText(/to sort out first/)).toBeVisible();
 await page.getByRole('button',{name:'I can borrow this'}).first().click();
 await expect(page.getByText('You can start today.')).toBeVisible();
 await page.getByRole('button',{name:'OPEN MY DESKTOP'}).click();
 await expect(page).toHaveURL(/\/home$/);
 const final=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!));
 expect(final.ledger).toEqual([]);
 expect(final.gear['reading-0']).toBe('borrowing');
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
