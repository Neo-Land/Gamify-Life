/** Self-reported experience, per hobby. Questions ask about recent, concrete behaviour rather than
 * self-rating, because behaviour is far better calibrated. One question per hobby covers equipment
 * access, because the start kit uses it; one covers how recently, because a lapsed intermediate
 * needs the refresher path rather than the beginner one. Nothing here asks about health,
 * injuries, weight or age — where readiness matters the safety node handles it with general guidance. */
export type PlacementQuestion={id:string;prompt:string;options:{label:string;score:number}[]};
const recency=(id:string):PlacementQuestion=>({id,prompt:'When did you last do this?',
 options:[{label:'Never',score:0},{label:'Over a year ago',score:1},{label:'In the last few months',score:2},{label:'In the last week or two',score:3}]});
const four=(id:string,prompt:string,a:string,b:string,c:string,d:string):PlacementQuestion=>
 ({id,prompt,options:[{label:a,score:0},{label:b,score:1},{label:c,score:2},{label:d,score:3}]});
export const placementQuestions:Record<string,PlacementQuestion[]>={
 tennis:[
  four('ten-freq','How often have you played in the last month?','Not at all','Once or twice','Most weeks','Several times a week'),
  four('ten-rally','How long a rally can you keep going comfortably?','Haven’t tried','A few hits','Ten or so','Twenty and beyond'),
  four('ten-serve','How reliable is your serve?','No serve yet','Sometimes lands','Usually lands','Lands where I aim'),
  four('ten-access','What do you have access to?','Nothing yet','A wall','A court I can book','A court and a regular partner'),
  recency('ten-recency')],
 cycling:[
  four('cyc-freq','How often have you ridden in the last month?','Not at all','Once or twice','Most weeks','Several times a week'),
  four('cyc-traffic','How comfortable are you riding near traffic?','Haven’t tried','Quiet streets only','Most roads','Confident anywhere I plan'),
  four('cyc-maint','What can you do to your own bike?','Nothing yet','Pump the tyres','Fix a puncture','Adjust brakes and gears'),
  four('cyc-access','Do you have a working bike?','No bike yet','Could borrow one','Have one needing work','Have one ready to ride'),
  recency('cyc-recency')],
 swimming:[
  four('swi-freq','How often have you swum in the last month?','Not at all','Once or twice','Most weeks','Several times a week'),
  four('swi-distance','How far can you swim comfortably without stopping?','Not yet','A width','A length or two','Several lengths'),
  four('swi-breath','How is your breathing while swimming?','Haven’t worked on it','I hold my breath','I exhale underwater','Breathing feels automatic'),
  four('swi-access','What pool access do you have?','None yet','Occasional','A pool I can reach weekly','Regular supervised access'),
  recency('swi-recency')],
 journaling:[
  four('jou-freq','How often have you written in the last month?','Not at all','Once or twice','Most weeks','Nearly every day'),
  four('jou-length','How long do you usually write for?','Haven’t started','A line or two','Five or ten minutes','Twenty minutes or more'),
  four('jou-habit','Do you have a time of day for it?','No','I have tried to','Usually the same time','A settled routine'),
  four('jou-access','What would you write in?','Nothing yet','Notes on my phone','A notebook I own','A notebook I use already'),
  recency('jou-recency')],
 'pc-building':[
  four('pcb-freq','How much have you worked inside a computer?','Never opened one','Opened one and looked','Swapped a part or two','Built or rebuilt one'),
  four('pcb-parts','How well do you know what the parts do?','Not at all','I know the names','I know what each does','I can spec a compatible list'),
  four('pcb-fault','Have you diagnosed a hardware fault?','No','Followed a guide','Worked one out myself','Several, methodically'),
  four('pcb-access','What do you have to work with?','Nothing yet','A screwdriver','Some parts or an old machine','Parts ready to build'),
  recency('pcb-recency')],
 drawing:[
  four('drw-freq','How often have you drawn in the last month?','Not at all','Once or twice','Most weeks','Nearly every day'),
  four('drw-observe','How do you usually start a drawing?','Haven’t drawn','Straight into detail','With an outline','With big shapes and proportion'),
  four('drw-value','How comfortable are you with light and shadow?','Haven’t tried','I shade a bit','I use a light source','I control values deliberately'),
  four('drw-access','What materials do you have?','None yet','A pen and paper','Pencils and paper','Pencils, paper and a sketchbook'),
  recency('drw-recency')],
 painting:[
  four('pnt-freq','How often have you painted in the last month?','Not at all','Once or twice','Most weeks','Several times a week'),
  four('pnt-mix','How comfortable are you mixing colours?','Haven’t tried','I use them from the tube','I mix simple colours','I can match what I see'),
  four('pnt-subject','How far have you taken a painting?','Not yet','Swatches and marks','A simple study','A finished piece'),
  four('pnt-access','What paints do you have?','None yet','Could borrow some','A basic set','A set and surfaces ready'),
  recency('pnt-recency')],
 running:[
  four('run-freq','How often have you run in the last month?','Not at all','Once or twice','Most weeks','Several times a week'),
  four('run-distance','What is the furthest you have run comfortably, recently?','Haven’t tried','Around a mile','Three miles or so','Six miles or more'),
  four('run-continuous','Can you run continuously without walking?','Not yet','A few minutes','Twenty minutes or so','Well over half an hour'),
  four('run-access','What footwear do you have?','Nothing suitable','Old trainers','Comfortable trainers','Trainers I run in regularly'),
  recency('run-recency')],
 volleyball:[
  four('vol-freq','How often have you played in the last month?','Not at all','Once or twice','Most weeks','Several times a week'),
  four('vol-pass','How is your forearm pass?','Haven’t tried','Hit and miss','Usually controlled','Consistent under pressure'),
  four('vol-rules','How well do you know rotation and scoring?','Not at all','Roughly','Well enough to play','I can explain it to someone'),
  four('vol-access','Do you have somewhere to play?','Not yet','I know of a session','A session I could join','A session I already attend'),
  recency('vol-recency')],
 reading:[
  four('rdg-freq','How many days did you read in the last month?','None','A few','Most weeks','Nearly every day'),
  four('rdg-books','How many books have you finished this year?','None yet','One or two','A handful','Ten or more'),
  four('rdg-range','How varied is what you read?','Haven’t started','One favourite kind','Two or three kinds','I read widely on purpose'),
  four('rdg-access','What do you have to read?','Nothing yet','Something borrowed','Books I own','A library card and a list'),
  recency('rdg-recency')]
};
/** Unanswered questions score zero, so a partly filled quiz places low rather than failing. */
export function scorePlacement(hobbyId:string,answers:Record<string,number>){
 const qs=placementQuestions[hobbyId];if(!qs?.length)return 0;
 const max=qs.reduce((a,q)=>a+Math.max(...q.options.map(o=>o.score)),0);
 const got=qs.reduce((a,q)=>a+(answers[q.id]??0),0);
 const ratio=max?got/max:0;
 return ratio>=.75?3:ratio>=.45?2:ratio>=.2?1:0;
}
