import {initialState,stateSchema,type Command,type State} from '../domain';
import {applyCommand} from '../progression';
import type {ProgressRepository} from './types';
const key='gamify-life:v1';
export class LocalProgressRepository implements ProgressRepository {
 readonly mode='demo' as const;
 async read():Promise<State>{const raw=sessionStorage.getItem(key);if(!raw)return initialState();try{return stateSchema.parse(JSON.parse(raw));}catch{throw new Error('Your saved data could not be read. Export it before resetting so you keep a copy.');}}
 async mutate(command:Command){const change=async()=>{const result=applyCommand(await this.read(),command);sessionStorage.setItem(key,JSON.stringify(result.state));return result;};return navigator.locks?navigator.locks.request(key,change):change();}
 async exportData(){return sessionStorage.getItem(key)||JSON.stringify(initialState(),null,2);}
 async reset(){const s=initialState();sessionStorage.setItem(key,JSON.stringify(s));return s;}
}
