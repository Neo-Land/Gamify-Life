import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>{sessionStorage.setItem('gamify-life:booted','true');});});
test('skipping character creation lands on hobbies and nudges from home',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'CONTINUE AS GUEST'}).click();
 await page.getByRole('button',{name:'BEGIN GUEST SESSION'}).click();
 await page.getByRole('button',{name:'SKIP FOR NOW'}).click();
 await expect(page.getByRole('heading',{name:'CHOOSE YOUR PATH'})).toBeVisible();
 const tint=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).profile);
 expect(tint.characterSkipped).toBe(true);
 expect(tint.characterTint).not.toBeNull();
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!).ledger)).toEqual([]);
 await page.getByRole('button',{name:/Journaling/}).click();
 await page.getByRole('button',{name:'OPEN MY DESKTOP'}).click();
 const nudge=page.locator('.customize-nudge');
 await expect(nudge).toBeVisible();
 await nudge.getByRole('button',{name:'Dismiss character nudge'}).click();
 await expect(nudge).toHaveCount(0);
});
