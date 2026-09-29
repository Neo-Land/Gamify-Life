'use client';
import {ReactFlow,Background,Controls,Handle,Position,type NodeProps,type Node,type Edge} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type {SkillNode} from '@/lib/content';
import {SkillCard} from './skill-card';
export type SkillFlow=Node<{skill:SkillNode;status:string;suggested?:boolean;onSelect?:(id:string)=>void},'skill'>|Node<{label:string},'marker'>;
function FlowCard({data}:NodeProps<Node<{skill:SkillNode;status:string;suggested?:boolean;onSelect?:(id:string)=>void},'skill'>>){return <><Handle type="target" position={Position.Top}/><SkillCard node={data.skill} status={data.status} suggested={data.suggested} onSelect={data.onSelect} compact/><Handle type="source" position={Position.Bottom}/></>;}
/** Rides in the graph so it pans and zooms with the node it points at. */
function StartMarker(){return <div className="start-here" aria-hidden="true"><b>START HERE</b><span>▼</span></div>;}
const nodeTypes={skill:FlowCard,marker:StartMarker};
export default function SkillCanvas({nodes,edges}:{nodes:SkillFlow[];edges:Edge[]}){return <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{padding:.18}} minZoom={.25} maxZoom={1.5} nodesDraggable={false} nodesConnectable={false} proOptions={{hideAttribution:true}}><Background color="#B3AE9E" gap={20}/><Controls showInteractive={false}/></ReactFlow>;}
