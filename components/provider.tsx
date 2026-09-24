'use client';
import {createContext,useContext,useEffect,useState,useCallback,useRef,type ReactNode} from 'react';
import {initialState,type State,type Command,type CompletionResult} from '@/lib/domain';
import {LocalProgressRepository} from '@/lib/repositories/local';
import {SupabaseProgressRepository} from '@/lib/repositories/supabase';
import type {ProgressRepository} from '@/lib/repositories/types';
import {supabase} from '@/lib/supabase';
import type {ThemeChoice} from '@/lib/themes';
import {rewardFor,type RewardEvent} from '@/lib/rewards';
interface Context{themePreview:ThemeChoice|null;setThemePreview:(v:ThemeChoice|null)=>void;state:State;loaded:boolean;sessionActive:boolean;endGuest:()=>void;busy:boolean;error:string;mode:'demo'|'cloud';run:(c:Command)=>Promise<(CompletionResult&{reward:RewardEvent|null})|null>;reward:RewardEvent|null;clearReward:()=>void;demo:()=>Promise<void>;reset:()=>Promise<boolean>;exportData:()=>Promise<void>;clearError:()=>void}
const Context=createContext<Context|null>(null);
export function Provider({children}:{children:ReactNode}){
 const [themePreview,setThemePreview]=useState<ThemeChoice|null>(null);const [reward,setReward]=useState<RewardEvent|null>(null);
 const [sessionActive,setSessionActive]=useState(false);const [state,setState]=useState(initialState);const [loaded,setLoaded]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [mode,setMode]=useState<'demo'|'cloud'>('demo');const repo=useRef<ProgressRepository>(new LocalProgressRepository());
 /** run() is memoised with no deps, so the committed state is read through a ref to work out what a command actually earned. */
 const previous=useRef(state);useEffect(()=>{previous.current=state;},[state]);
 const load=useCallback(async(r:ProgressRepository)=>{if(repo.current.mode!==r.mode)setState(initialState());repo.current=r;setMode(r.mode);setSessionActive(r.mode==='cloud'||sessionStorage.getItem('gamify-life:guest-active')==='true');try{setState(await r.read());setError('');}catch(e){setError((e as Error).message);}finally{setLoaded(true);}},[]);
 useEffect(()=>{let alive=true;async function init(){const session=supabase?(await supabase.auth.getSession()).data.session:null;if(alive)await load(session?new SupabaseProgressRepository():new LocalProgressRepository());}void init();const subscription=supabase?.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(()=>{if(alive)void load(session?new SupabaseProgressRepository():new LocalProgressRepository());},0);});const refresh=()=>{if(repo.current.mode==='demo')void load(repo.current);};window.addEventListener('storage',refresh);return()=>{alive=false;subscription?.data.subscription.unsubscribe();window.removeEventListener('storage',refresh);};},[load]);
 useEffect(()=>{document.documentElement.dataset.motion=state.profile.reducedMotion?'reduced':'normal';document.documentElement.dataset.theme=state.profile.theme;document.documentElement.dataset.colorway=state.profile.colorway;document.documentElement.dataset.texture=state.profile.scanlinesEnabled?'on':'off';document.documentElement.dataset.text=state.profile.largerText?'large':'normal';},[state.profile]);
 const run=useCallback(async(c:Command)=>{const quiet=c.type==='window';if(!quiet){setBusy(true);setError('');}try{const result=await repo.current.mutate(c);const earned=rewardFor(previous.current,result.state,result);setState(result.state);
  // Completing a node opens a dialog that reports the XP, the level-ups and every unlock, so no
  // toast there. Logging practice reports only its XP, so the toast keeps the rest and drops the
  // number. Everything else — quests, gear-driven achievements — had no feedback at all.
  if(earned&&c.type!=='complete'&&c.type!=='master'){
   const toast=c.type==='practice'?{...earned,xp:0,sources:[]}:earned;
   if(toast.xp||toast.lifeLevel!==null||toast.hobbyLevelUps.length||toast.achievements.length||toast.cosmetics.length)setReward(toast);}if(result.xpAwarded&&result.state.profile.sound){try{const a=new AudioContext();const o=a.createOscillator();const g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=660;g.gain.setValueAtTime(.04,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.2);o.start();o.stop(a.currentTime+.2);o.onended=()=>void a.close();}catch{/* Sound is optional. */}}return {...result,reward:earned};}catch(e){setError((e as Error).message);return null;}finally{if(!quiet)setBusy(false);}},[]);
 const clearError=useCallback(()=>setError(''),[]);
 const exportData=async()=>{try{const blob=new Blob([await repo.current.exportData()],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='gamify-life-progress.json';a.click();URL.revokeObjectURL(url);}catch(e){setError((e as Error).message);}};
 return <Context.Provider value={{themePreview,setThemePreview,state,loaded,sessionActive,endGuest:()=>{sessionStorage.removeItem('gamify-life:v1');sessionStorage.removeItem('gamify-life:guest-active');setState(initialState());setSessionActive(false);},busy,error,mode,run,reward,clearReward:()=>setReward(null),demo:async()=>{sessionStorage.setItem('gamify-life:guest-active','true');if(supabase)await supabase.auth.signOut();await load(new LocalProgressRepository());},reset:async()=>{try{setState(await repo.current.reset());setError('');return true;}catch(e){setError((e as Error).message);return false;}},exportData,clearError}}>{children}</Context.Provider>;
}
export function useGame(){const c=useContext(Context);if(!c)throw new Error('Missing provider');return c;}
