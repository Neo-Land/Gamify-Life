import {NextResponse} from 'next/server';
import {authenticate} from '@/lib/server';
import {initialState,stateSchema,commandSchema} from '@/lib/domain';
import {applyCommand} from '@/lib/progression';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const {db,user}=await authenticate(request);const {data,error}=await db.from('progress_snapshots').select('state').eq('user_id',user.id).maybeSingle();if(error)throw error;return NextResponse.json(data?.state??initialState(),{headers:{'Cache-Control':'no-store'}});}catch(e){const error=(e as Error).message;return NextResponse.json({error},{status:error==='Unauthorized'?401:503});}}
export async function POST(request:Request){try{const {db,user}=await authenticate(request);const raw=await request.text();if(raw.length>12000)return NextResponse.json({error:'Request too large'},{status:413});const command=commandSchema.parse(JSON.parse(raw));for(let attempt=0;attempt<5;attempt++){
 const {data,error}=await db.from('progress_snapshots').select('state,revision').eq('user_id',user.id).maybeSingle();if(error)throw error;
 const current=data?stateSchema.parse(data.state):initialState();const result=applyCommand(current,command);
 const {data:saved,error:writeError}=await db.rpc('commit_progress',{p_user_id:user.id,p_expected_revision:data?.revision??0,p_state:result.state});if(writeError)throw writeError;if(saved)return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
 }return NextResponse.json({error:'Progress changed in another tab. Please retry.'},{status:409});}catch(e){const error=(e as Error).message;return NextResponse.json({error},{status:error==='Unauthorized'?401:400});}}
