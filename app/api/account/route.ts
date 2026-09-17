import {NextResponse} from 'next/server';
import {authenticate} from '@/lib/server';
export async function DELETE(request:Request){try{const {db,user}=await authenticate(request);const {error}=await db.auth.admin.deleteUser(user.id);if(error)throw error;return NextResponse.json({deleted:true});}catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}}
