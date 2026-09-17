"""Original deterministic, layered pixel scenery; no external image assets."""
from pathlib import Path
import random
for season in ['fall','summer','winter','spring']:
 r=random.Random(42)
 sky,far,ground,leaf= {'fall':('#e8b28e','#a88079','#a58d58',['#b26440','#cf8d46','#d9b363','#9a5540']), 'summer':('#99c5cf','#738b96','#799476',['#4c7962','#61896a','#789867','#456b60']), 'winter':('#a9b4cc','#7a88a0','#d7e0dc',['#718c92','#8da4aa','#b6c5c7','#e2e7df']), 'spring':('#c1d5cc','#92aaa0','#92aa79',['#a9b584','#d9b2ab','#edc8b4','#749678'])}[season]
 layers={'sky':[], 'landscape':[], 'foreground':[]};out=layers['sky']
 def rect(x,y,w,h,c):out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>')
 def path(d,c):out.append(f'<path d="{d}" fill="{c}"/>')
 rect(0,0,640,400,sky)
 for i in range(8):rect(0,150+i*9,640,9,['#e8d5af','#d8dac1'][season in ['spring','summer']])
 rect(495,38,30,30,'#f5dfad');rect(489,44,42,18,'#f5dfad')
 for x,y in [(65,38),(195,75),(360,30),(565,95)]:
  rect(x,y,45,8,'#e8e6ce');rect(x+10,y-6,25,8,'#e8e6ce');rect(x-9,y+6,63,5,'#d8d6bf')
 out=layers['landscape']
 path('M0 210V166H24V150H46V165H70V138H100V117H132V140H157V164H188V134H215V94H245V125H270V151H310V132H348V155H382V123H410V92H435V114H460V148H485V130H520V142H550V115H575V156H606V140H640V400H0Z',far)
 if season=='summer':
  path('M180 136H206V108H215V94H245V125H254V133H235V124H220V138Z','#d5d9cc');rect(0,205,640,195,'#78a8ac')
  for i in range(170):rect(r.randrange(640),r.randrange(210,400),r.randrange(3,20),1,r.choice(['#a4c9c6','#8db8b6','#5e969f']))
  path('M0 290H80V305H128V322H180V347H257V369H370V389H640V400H0Z','#c7bd91')
 else:
  rect(0,205,640,195,ground)
  path('M330 206H347V220H331V235H310V253H284V274H266V296H252V327H264V352H294V381H326V400H190V375H176V340H182V299H211V271H243V249H280V233H307V218H330Z', '#ced6d2' if season=='winter' else '#c7b58c')
 if season=='winter':
  for x,h in [(25,91),(95,67),(171,106),(430,90),(510,120),(585,83)]:
   rect(x,218-h,44,h,'#65778a');rect(x-4,215-h,52,6,'#e6e7d9');rect(x+6,220-h,4,h-2,'#8c9da8')
   for y in range(230-h,206,14):
    for dx in [15,30]:rect(x+dx,y,6,8,'#e9cf94')
  for x in [65,390,554]:
   rect(x,224,3,56,'#566779');rect(x-5,215,13,13,'#f1d9a2');rect(x-7,213,17,3,'#667887');rect(x-4,229,11,3,'#667887')
  rect(453,270,38,4,'#8e857a');rect(453,277,38,4,'#8e857a');rect(458,280,3,10,'#556674');rect(484,280,3,10,'#556674')
 else:
  rect(440,188,40,31,'#8d7761');path('M432 190V184H442V176H454V169H467V177H480V184H488V190Z','#746657');rect(450,194,10,9,'#f1d095');rect(467,199,7,20,'#615b4e');rect(443,189,36,2,'#ad9471')
 out=layers['foreground']
 def tree(x,y,s):
  out.append(f'<g transform="translate({x} {y}) scale({s})">')
  rect(-3,-12,7,72,'#6e6552');rect(1,2,2,54,'#9a8060')
  for j in range(42):
   xx=r.randrange(-31,30)//4*4;yy=r.randrange(-32,18)//4*4
   if (xx/34)**2+((yy+8)/34)**2<1.6:rect(xx,yy,r.choice([8,12,16]),r.choice([6,10,14]),r.choice(leaf))
  rect(-14,24,13,3,'#6e6552');rect(5,14,13,3,'#6e6552');out.append('</g>')
 for args in [(18,196,1.4),(80,202,.7),(590,198,.9),(635,193,1.4)]:tree(*args)
 for i in range(450):
  x=r.randrange(640);y=r.randrange(250,400)
  if season=='summer' and x>y-215:continue
  c=r.choice(leaf if season=='fall' else ['#f1e8d9','#becfcd'] if season=='winter' else ['#688759','#a4b779','#79986a'])
  rect(x,y,r.choice([1,2,3]),r.choice([1,2,4]),c)
  if season=='spring' and i%5==0:
   rect(x,y-2,3,3,r.choice(['#e8cab4','#d09f99','#e7d88c']));rect(x+1,y-1,1,1,'#a88954')
 for name,items in layers.items():Path(f'public/themes/{season}-{name}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">'+''.join(items)+'</svg>')
