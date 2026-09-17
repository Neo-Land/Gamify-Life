"""One-time import of the user-supplied canonical tables; editorial lessons live separately."""
import re,json,pathlib
text=pathlib.Path('docs/GamifyLife_Codex_Build_Spec.md').read_text()
hobbies=[dict(id='tennis',name='Tennis',icon='🎾',color='#D98C8C',description='Find your rhythm. One rally at a time.',prefix='ten'),dict(id='cycling',name='Cycling / Fixed Gear',icon='🚲',color='#D6B65C',description='A little farther. A little more freedom.',prefix='cyc'),dict(id='swimming',name='Swimming',icon='🏊',color='#72B7A4',description='Build confidence, one length at a time.',prefix='swi'),dict(id='journaling',name='Journaling',icon='📔',color='#AE9BC8',description='Make a little space for your thoughts.',prefix='jou')]
nodes=[]
for line in text.splitlines():
 if not re.match(r'\| (ten-|cyc-|fixie-|swi-|jou-)',line):continue
 id,tier,title,typ,xp,req,prompt=[x.strip() for x in line.strip('|').split('|')]
 h=next(h for h in hobbies if id.startswith(h['prefix']) or id.startswith('fixie') and h['id']=='cycling')
 requires=re.findall(r'(?:ten|cyc|fixie|swi|jou)-[a-z0-9]+',req); groups=[]
 if id=='jou-week':requires=['jou-friction'];groups=[['jou-daily','jou-reflect','jou-gratitude']]
 if id=='jou-project':requires=['jou-review'];groups=[['jou-bullet','jou-long','jou-common']]
 n=dict(id=id,hobbyId=h['id'],slug=id,title=title,tier=tier.lower(),nodeType=typ,xpReward=int(xp),requires=requires,orGroups=groups,completion=dict(prompt=prompt,evidenceMode='honor'),estimatedMinutes=10 if typ in ['orientation','gear','lesson'] else 20,isRequired=typ!='specialization',isSafetyCritical=id in ['ten-safety','cyc-safety','cyc-check','swi-safety'],isRecommended=True,status='published',contentVersion=1,sortOrder=len(nodes),tags=['Athletics','Knowledge'] if h['id']!='journaling' else ['Creativity','Wellness'],category={'orientation':'Orientation','gear':'Gear','lesson':'Technique','practice':'Practice','challenge':'Practice','milestone':'Milestones','specialization':'Specialization','maintenance':'Maintenance'}[typ],review_status='draft',source_urls=[],last_reviewed_at=None)
 if id=='jou-first':n['completion'].update(evidenceMode='duration',targetValue=5,targetUnit='minutes')
 elif id=='jou-long':n['completion'].update(evidenceMode='duration',targetValue=20,targetUnit='minutes')
 elif re.search(r'\b(10|20|25|200)\b',prompt) and id not in ['swi-25','swi-200','cyc-25','cyc-control','ten-serve1']:
  v=int(re.search(r'\b(10|20|25|200)\b',prompt)[0]);n['completion'].update(evidenceMode='count',targetValue=v,targetUnit='repetitions')
 if id in ['cyc-first5','cyc-10','cyc-25']:n['completion'].update(evidenceMode='count',targetValue={'cyc-first5':5,'cyc-10':10,'cyc-25':25}[id],targetUnit='miles')
 if id in ['swi-25','swi-200']:n['completion'].update(evidenceMode='count',targetValue=25 if id=='swi-25' else 200,targetUnit='yards or meters')
 if typ=='orientation' and not n['isSafetyCritical']:n['completion']['evidenceMode']='note'
 nodes.append(n)
for h in hobbies:
 hn=[n for n in nodes if n['hobbyId']==h['id']];levels={}
 def depth(n):
  if n['id'] in levels:return levels[n['id']]
  deps=n['requires']+[x for group in n['orGroups'] for x in group]
  levels[n['id']]=max([depth(next(x for x in hn if x['id']==d))+1 for d in deps] or [0]);return levels[n['id']]
 rows={}
 for n in hn:
  d=depth(n);rows.setdefault(d,[]).append(n)
 for d,row in rows.items():
  for i,n in enumerate(row):n['position']={'x':(i-(len(row)-1)/2)*270+450,'y':d*150}
pathlib.Path('content/hobbies.json').write_text(json.dumps(hobbies,indent=2)+'\n')
pathlib.Path('content/nodes.json').write_text(json.dumps(nodes,indent=2)+'\n')
print(f'Imported {len(nodes)} canonical nodes')
