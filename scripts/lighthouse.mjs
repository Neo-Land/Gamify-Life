import lighthouse from 'lighthouse';
import {createRequire} from 'node:module';
const {launch}=await import(createRequire(import.meta.resolve('lighthouse')).resolve('chrome-launcher'));
import {chromium} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
const chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox']});
try{mkdirSync('test-results',{recursive:true});for(const route of ['home','hobbies/tennis']){const r=await lighthouse(`http://127.0.0.1:3001/${route}`,{port:chrome.port,output:'json',onlyCategories:['performance','accessibility'],logLevel:'error'});writeFileSync(`test-results/lighthouse-${route.replaceAll('/','-')}.json`,r.report);console.log(JSON.stringify({route,performance:r.lhr.categories.performance.score,accessibility:r.lhr.categories.accessibility.score,failed:r.lhr.categories.accessibility.auditRefs.filter(a=>r.lhr.audits[a.id].score===0).map(a=>a.id)}));}}finally{await chrome.kill();}
