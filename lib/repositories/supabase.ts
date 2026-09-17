import {supabase} from '../supabase';
import {stateSchema,type Command,type CompletionResult} from '../domain';
import type {ProgressRepository} from './types';
export class SupabaseProgressRepository implements ProgressRepository{
 readonly mode='cloud' as const;
 private async request(method:string,body?:Command){const {data}=await supabase!.auth.getSession();if(!data.session)throw new Error('Sign in to load cloud progress.');const response=await fetch('/api/progress',{method,headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const value=await response.json();if(!response.ok)throw new Error(value.error||'Cloud unavailable. Try again when connected.');return value;}
 async read(){return stateSchema.parse(await this.request('GET'));}
 async mutate(command:Command):Promise<CompletionResult>{return this.request('POST',command);}
 async exportData(){return JSON.stringify(await this.read(),null,2);}
 async reset():Promise<never>{throw new Error('Reset is available only in demo mode. Cloud accounts can be deleted in Settings.');}
}
