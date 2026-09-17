'use client';
import {ReactFlow,Background,Controls,Handle,Position,type NodeProps,type Node,type Edge} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type {SkillNode} from '@/lib/content';
import {SkillCard} from './skill-card';
export type SkillFlow=Node<{skill:SkillNode;status:string},'skill'>;
function FlowCard({data}:NodeProps<SkillFlow>){return <><Handle type="target" position={Position.Top}/><SkillCard node={data.skill} status={data.status} compact/><Handle type="source" position={Position.Bottom}/></>;}
const nodeTypes={skill:FlowCard};
export default function SkillCanvas({nodes,edges}:{nodes:SkillFlow[];edges:Edge[]}){return <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{padding:.18}} minZoom={.25} maxZoom={1.5} nodesDraggable={false} nodesConnectable={false} proOptions={{hideAttribution:true}}><Background color="#B3AE9E" gap={20}/><Controls showInteractive={false}/></ReactFlow>;}
