import {nodes,hobbies} from '../lib/content';
const visited=new Set<string>();const visiting=new Set<string>();
function visit(id:string){if(visiting.has(id))throw new Error(`Cycle at ${id}`);if(visited.has(id))return;const n=nodes.find(n=>n.id===id);if(!n)throw new Error(`Missing ${id}`);visiting.add(id);for(const p of [...n.requires,...n.orGroups.flat()])visit(p);visiting.delete(id);visited.add(id);if(n.instructions.length<2||!n.commonMistakes.length||!n.resources.length)throw new Error(`Missing lesson for ${id}`);}
if(new Set(nodes.map(n=>n.id)).size!==nodes.length)throw new Error('Duplicate node ID');
nodes.forEach(n=>visit(n.id));hobbies.forEach(h=>{if(!nodes.some(n=>n.hobbyId===h.id))throw new Error(`Empty hobby ${h.id}`);});console.log(`Validated ${nodes.length} lessons, ${hobbies.length} hobbies, all edges and no cycles.`);
