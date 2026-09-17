'use client';
import {TreePage,NodePage} from './skills';
export function SkillMap({hobbyId,nodeId}:{hobbyId:string;nodeId:string}){return <div className="skill-map-with-detail"><div className="map-overview"><TreePage hobbyId={hobbyId}/></div><section className="node-detail-panel" aria-label="Selected node details"><NodePage key={nodeId} hobbyId={hobbyId} nodeId={nodeId}/></section></div>;}
