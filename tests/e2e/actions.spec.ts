import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {initialState,type State} from '../../lib/domain';
import {applyCommand} from '../../lib/progression';
import {hobbies,nodes,gear,quests} from '../../lib/content';
test.beforeEach(async({page})=>{let base=initialState();base.profile.onboardingComplete=true;base=applyCommand(base,{type:'enroll',hobbyIds:hobbies.map(h=>h.id) as never}).state;await page.addInitScript(s=>{sessionStorage.setItem('gamify-life:guest-active','true');sessionStorage.setItem('gamify-life:booted','true');if(!sessionStorage.getItem('gamify-life:v1'))sessionStorage.setItem('gamify-life:v1',JSON.stringify(s));},base);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));(page as Page & {runtimeErrors:string[]}).runtimeErrors=errors;});
test.afterEach(async({page})=>{expect((page as Page & {runtimeErrors:string[]}).runtimeErrors).toEqual([]);});
const evidence={value:1000,confirmed:true,note:'Completed the real-world checklist.',confidence:3};
function readyState(){let s=initialState();s=applyCommand(s,{type:'enroll',hobbyIds:hobbies.map(h=>h.id) as never}).state;s.profile.onboardingComplete=true; // Derived, not listed: every hobby's practice prerequisites and the chain each one depends on,
 // so adding a hobby does not silently leave its practice dialog blocked.
 const need=new Set<string>();
 // Gear nodes are deliberately excluded: completing one requires the hobby's gear to be recorded,
 // and the tests that care about that record it themselves.
 const pull=(id:string)=>{if(need.has(id)||id.endsWith('-gear'))return;const n=nodes.find(x=>x.id===id);if(!n)return;n.requires.forEach(pull);need.add(id);};
 for(const h of hobbies)h.practicePrerequisites.forEach(pull);
 // Quest prerequisites too, or a new hobby's quest is unpinnable and the cap test cannot reach it.
 for(const q of quests)q.requires.forEach(pull);
 for(const id of need)s=applyCommand(s,{type:'complete',nodeId:id,evidence}).state;return s;}
async function seed(page:Page,state:State){await page.addInitScript(s=>{if(!sessionStorage.getItem('e2e-custom-seeded')){sessionStorage.setItem('gamify-life:v1',JSON.stringify(s));sessionStorage.setItem('e2e-custom-seeded','true');}},state);}
/** Gear groups that need no action are folded shut; open whatever holds the item under test. */
async function openAllGroups(page:Page){await expect(page.getByRole('tab',{name:'Gear'})).toHaveAttribute('aria-selected','true');for(const g of await page.locator('.gear-group:not([open]) > summary').all())await g.click();}
async function openGroupFor(page:Page,name:string){await openAllGroups(page);await expect(page.getByLabel(`${name} status`,{exact:true})).toBeVisible();}
async function saved(page:Page):Promise<State>{return page.evaluate(()=>JSON.parse(sessionStorage.getItem('gamify-life:v1')!));}
/** Practice lives inside its hobby now: Hobbies → that hobby → This week. */
async function week(page:Page,hobby='tennis'){if(!new RegExp(`/hobbies/${hobby}$`).test(page.url()))await page.goto(`/hobbies/${hobby}`);await page.getByRole('tab',{name:'This week'}).click();}
async function practice(page:Page,hobby='tennis'){await week(page,hobby);await page.getByRole('region',{name:`${hobby}.quest`,exact:true}).getByRole('button',{name:'Log a practice session'}).click();return page.getByRole('dialog');}

test('practice explains missing safety before submission and links to the solution',async({page})=>{
 const dialog=await practice(page);
 await expect(dialog.getByRole('heading',{name:'Before logging practice'})).toBeVisible();
 await expect(dialog.getByRole('button',{name:'Save practice'})).toBeDisabled();
 await dialog.getByRole('link',{name:'Court Safety & Etiquette ↗'}).click();
 await expect(page).toHaveURL(/nodes\/ten-safety$/);await expect(page.getByRole('dialog')).toHaveCount(0);
});
for(const h of hobbies)test(`${h.id} practice validates, saves, confirms, and survives refresh`,async({page})=>{
 await seed(page,readyState());let dialog=await practice(page,h.id);
 await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('alert')).toContainText('confirm that you practiced safely');
 await dialog.getByLabel('I practiced safely in a suitable environment.').check();
 await dialog.getByLabel('Minutes practiced').fill('0');await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('alert')).toContainText('whole number');
 await dialog.getByLabel('Minutes practiced').fill('1.5');await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('alert')).toContainText('whole number');
 await dialog.getByLabel('Minutes practiced').fill('30');await dialog.getByLabel('Private reflection (optional)').fill(`A good ${h.id} session.`);
 await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('heading',{name:'Practice saved'})).toBeVisible();await expect(dialog.getByRole('status')).toContainText('+20 XP');
 await dialog.getByRole('button',{name:'Done',exact:true}).click();await expect(page.getByRole('region',{name:'Practice journal'})).toContainText(`A good ${h.id} session.`);
 await page.reload();expect((await saved(page)).practice.filter(p=>p.hobbyId===h.id)).toHaveLength(1);
 dialog=await practice(page,h.id);await expect(dialog.getByLabel('Private reflection (optional)')).toHaveValue('');await expect(dialog.getByLabel('I practiced safely in a suitable environment.')).not.toBeChecked();
 await dialog.getByLabel('I practiced safely in a suitable environment.').check();await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('status')).toContainText('already earned');await dialog.getByRole('button',{name:'Done',exact:true}).click();
 const s=await saved(page);expect(s.practice.filter(p=>p.hobbyId===h.id)).toHaveLength(2);expect(s.ledger.filter(l=>l.id.startsWith(`practice:${h.id}:`))).toHaveLength(1);
});
test('practice cancel, close, Escape and cross-hobby switching leave no phantom sessions',async({page})=>{
 await seed(page,readyState());let dialog=await practice(page);
 await dialog.getByLabel('Private reflection (optional)').fill('Unsaved tennis note');await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 dialog=await practice(page,'swimming');await expect(dialog.getByLabel('Private reflection (optional)')).toHaveValue('');await dialog.getByRole('button',{name:'Close dialog'}).click();
 await practice(page,'journaling');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);expect((await saved(page)).practice).toHaveLength(0);
});
test('practice rapid repeated submissions create exactly one session',async({page})=>{
 await seed(page,readyState());const dialog=await practice(page);await dialog.getByLabel('I practiced safely in a suitable environment.').check();
 await dialog.locator('form').evaluate(form=>{for(let i=0;i<15;i++)(form as HTMLFormElement).requestSubmit();});
 await expect(dialog.getByRole('heading',{name:'Practice saved'})).toBeVisible();expect((await saved(page)).practice).toHaveLength(1);
});
test('storage failure is visible inside the dialog and a retry preserves the draft',async({page})=>{
 await seed(page,readyState());await page.addInitScript(()=>{const original=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(key,value){if(key==='gamify-life:v1'&&fail&&JSON.parse(value).practice?.length){fail=false;throw new DOMException('Storage is full.','QuotaExceededError');}return original.call(this,key,value);};});
 const dialog=await practice(page);await dialog.getByLabel('Private reflection (optional)').fill('Keep this note.');await dialog.getByLabel('I practiced safely in a suitable environment.').check();
 await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('alert')).toContainText('Storage is full');await expect(dialog.getByLabel('Private reflection (optional)')).toHaveValue('Keep this note.');
 await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('heading',{name:'Practice saved'})).toBeVisible();expect((await saved(page)).practice).toHaveLength(1);
});
test('quest pin cap, unpin, filters, manual progress and completed state respond',async({page})=>{
 const s=readyState();for(const g of gear.filter(g=>g.hobbyId==='tennis'&&g.necessity==='required'))s.gear[g.id]='owned';await seed(page,applyCommand(s,{type:'complete',nodeId:'ten-gear',evidence}).state);await week(page,'tennis');
 for(const id of ['tennis','cycling','swimming']){await week(page,id);await page.getByRole('region',{name:`${id}.quest`,exact:true}).getByRole('button',{name:'Pin this quest'}).click();}
 await week(page,'journaling');const journal=page.getByRole('region',{name:'journaling.quest',exact:true});await journal.getByRole('button',{name:'Pin this quest'}).click();await expect(page.locator('.desktop-error')).toContainText('at most three');
 await week(page,'tennis');await page.getByRole('region',{name:'tennis.quest',exact:true}).getByRole('button',{name:'Unpin quest'}).click();await week(page,'journaling');await journal.getByRole('button',{name:'Pin this quest'}).click();await expect(journal.getByRole('button',{name:'Unpin quest'})).toBeVisible();
 await page.getByRole('button',{name:'active',exact:true}).click();await expect(page.getByRole('region',{name:'tennis.quest',exact:true})).toHaveCount(0);await expect(journal).toBeVisible();
 await journal.getByRole('spinbutton').fill('3');await journal.getByRole('button',{name:'Log entries'}).click();await page.getByRole('button',{name:'completed',exact:true}).click();await expect(journal).toContainText('Complete this week');
 await page.getByRole('button',{name:'available',exact:true}).click();await expect(journal).toHaveCount(0);await page.getByRole('button',{name:'all',exact:true}).click();await expect(page.locator('.quest-grid .mac-window')).toHaveCount(1);
});
test('all loadout tabs and owned/wishlist/not-needed controls persist',async({page})=>{
 for(const h of hobbies){await page.goto(`/hobbies/${h.id}`);await page.getByRole('tab',{name:'Gear'}).click();await openAllGroups(page);const selector=page.locator('.gear-card select').first();const name=await selector.getAttribute('aria-label');await selector.selectOption('owned');const same=page.getByRole('combobox',{name:name!,exact:true});await expect(same).toHaveValue('owned');await same.selectOption('wishlist');await expect(same).toHaveValue('wishlist');await same.selectOption('not_needed');await expect(same).toHaveValue('not_needed');await same.selectOption('owned');}
 await page.reload();expect(Object.values((await saved(page)).gear).filter(v=>v==='owned')).toHaveLength(hobbies.length);
});
test('every closet category equips an available item and locked cosmetics stay disabled',async({page})=>{
 await page.goto('/character/appearance/top');for(const name of ['Skin','Hair','Hair color','Face','Tops','Bottoms','Outerwear','Shoes','Headwear','Face accessories','Bags','Accessories','Hobby props']){await page.getByRole('tab',{name,exact:true}).click();const item=page.locator('.closet-item:not(:disabled)').last();await item.click();await expect(item).toHaveAttribute('aria-pressed','true');}
 await page.getByRole('tab',{name:'Accessories',exact:true}).click();await expect(page.getByRole('button',{name:/Mint visor/})).toBeDisabled();const before=(await saved(page)).avatar;await page.reload();expect((await saved(page)).avatar).toEqual(before);
});
test('settings save/toggles/export and reset cancel/confirm work in an isolated profile',async({page})=>{
 await seed(page,readyState());await page.goto('/settings');await page.getByLabel('Your name',{exact:true}).fill('Button Tester');await page.getByRole('button',{name:'Save name',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Name saved.'})).toBeVisible();
 await page.getByRole('checkbox',{name:/Reduced motion/}).click();await expect(page.getByRole('checkbox',{name:/Reduced motion/})).toBeChecked();await page.getByRole('checkbox',{name:/A little sound/}).click();await expect(page.getByRole('checkbox',{name:/A little sound/})).toBeChecked();await page.getByLabel('Desktop theme').selectOption('contrast');await expect(page.getByLabel('Desktop theme')).toHaveValue('contrast');await page.reload();await expect(page.getByLabel('Your name',{exact:true})).toHaveValue('Button Tester');await expect(page.getByRole('checkbox',{name:/Reduced motion/})).toBeChecked();await expect(page.getByRole('checkbox',{name:/A little sound/})).toBeChecked();await expect(page.getByLabel('Desktop theme')).toHaveValue('contrast');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export progress as JSON'}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('gamify-life-progress.json');const stream=await download.createReadStream();let text='';for await(const chunk of stream!)text+=chunk;expect(JSON.parse(text).profile.name).toBe('Button Tester');
 await page.getByRole('button',{name:'Reset guest progress'}).click();await page.getByRole('button',{name:'Close dialog'}).click();expect((await saved(page)).profile.name).toBe('Button Tester');await page.getByRole('button',{name:'Reset guest progress'}).click();await page.getByRole('button',{name:'Yes, reset guest'}).click();await expect(page).toHaveURL('/');await expect(page.getByLabel('Character name')).toBeVisible();expect((await saved(page)).ledger).toHaveLength(0);
});
test('tree filter controls, zoom and all hobby navigation respond',async({page})=>{
 await page.goto(`/hobbies/${hobbies[0].id}`);for(const h of hobbies){await page.getByRole('navigation',{name:'Your hobbies'}).getByRole('link',{name:h.name}).click();await expect(page).toHaveURL(`/hobbies/${h.id}`);await expect(page.getByRole('navigation',{name:'Your hobbies'}).getByRole('link',{name:h.name})).toHaveAttribute('aria-current','page');await page.locator('.app-window.front').getByRole('button',{name:'Journey',exact:true}).click();await page.locator('.tree-filters > summary').click();await page.getByRole('combobox',{name:'Tier',exact:true}).selectOption('advanced');await expect(page.locator('.tier-heading')).toHaveCount(1);await page.getByRole('combobox',{name:'Tier',exact:true}).selectOption('all');await page.getByRole('combobox',{name:'Category',exact:true}).selectOption('Orientation');await expect(page.locator('.skill-card')).not.toHaveCount(0);await page.getByRole('combobox',{name:'Category',exact:true}).selectOption('all');await page.getByRole('combobox',{name:'Status',exact:true}).selectOption('available');await expect(page.locator('.skill-card')).toHaveCount(1);await page.getByRole('combobox',{name:'Status',exact:true}).selectOption('all');}
 await page.getByRole('link',{name:'+ New hobby',exact:true}).click();await expect(page).toHaveURL('/hobbies');
 await page.goto('/hobbies/tennis');await page.getByRole('button',{name:'Tree',exact:true}).click();await expect(page.locator('.react-flow__viewport')).toBeVisible();const original=await page.locator('.react-flow__viewport').getAttribute('style');await page.getByRole('button',{name:'Zoom In',exact:true}).click();await expect(page.locator('.react-flow__viewport')).not.toHaveAttribute('style',original!);await page.getByRole('button',{name:'Zoom Out',exact:true}).click();await page.getByRole('button',{name:'Fit View',exact:true}).click();
});
test('start, missing gear feedback, completion, mastery and practice action are functional',async({page})=>{
 await seed(page,readyState());await page.goto('/hobbies/tennis/nodes/ten-gear');await page.getByRole('button',{name:'ACCEPT QUEST',exact:true}).click();await expect(page.getByRole('button',{name:'ACCEPT QUEST',exact:true})).toHaveCount(0);await page.getByLabel('I completed this challenge in real life.').check();await page.getByRole('button',{name:'COMPLETE QUEST',exact:true}).click();await expect(page.locator('.desktop-error')).toContainText('what you have or can borrow');
 await page.locator('.lesson-section > summary').filter({hasText:'What to bring'}).click();await page.getByRole('link',{name:'Record in Gear ↗'}).first().click();// Derived from the gear data, and borrowing counts: the last required item is recorded as borrowed.
 const required=gear.filter(g=>g.hobbyId==='tennis'&&g.necessity==='required');for(const [i,g] of required.entries()){await openGroupFor(page,g.name);await page.getByLabel(`${g.name} status`,{exact:true}).selectOption(i===required.length-1?'borrowing':'owned');}await page.goto('/hobbies/tennis/nodes/ten-gear');await page.getByLabel('I completed this challenge in real life.').check();await page.getByRole('button',{name:'COMPLETE QUEST',exact:true}).click();await page.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('button',{name:/Try the mastery challenge/}).click();await page.getByLabel('What improved across three separate days?').fill('I checked my equipment on three practice days.');await page.getByLabel('I completed this challenge in real life.').check();await page.getByRole('button',{name:'Mark mastered',exact:true}).click();await expect(page.getByRole('heading',{name:'+15 XP',exact:true})).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('button',{name:'Log another practice',exact:true}).click();await expect(page.getByRole('dialog').getByRole('button',{name:'Save practice'})).toBeEnabled();await page.getByRole('button',{name:'Cancel',exact:true}).click();
});
test('practice dialog remains accessible with validation feedback and saved confirmation',async({page,isMobile})=>{
 await seed(page,readyState());const dialog=await practice(page);await dialog.getByRole('button',{name:'Save practice'}).click();
 const audit=async()=>{const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations.filter(v=>['serious','critical'].includes(v.impact||'')).map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);};
 await audit();await dialog.getByLabel('I practiced safely in a suitable environment.').check();await dialog.getByRole('button',{name:'Save practice'}).click();await expect(dialog.getByRole('heading',{name:'Practice saved'})).toBeVisible();await audit();await page.screenshot({path:`test-results/practice-saved-${isMobile?'mobile':'desktop'}.png`,fullPage:true});
});
