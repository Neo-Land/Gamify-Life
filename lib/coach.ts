// Future server-only coach contract. No runtime AI dependency in v0.1.
export const FEATURE_AI_COACH=false;
export interface CoachContext {hobby:{name:string;currentLevel:number};currentNode:{id:string;title:string};completedNodeTitles:string[];ownedGear:string[];recentPractice:{date:string;duration?:number;note?:string}[];userQuestion:string}
