-- Gamify.Life v0.1. Apply in Supabase SQL editor or `supabase db push`.
-- Private aggregate snapshots allow the same tested TypeScript reducer in both adapters.
-- The server authenticates the caller, validates each command, and uses CAS below.
-- No user can submit an arbitrary snapshot or ledger, including through the REST API.
create extension if not exists pgcrypto;
create table public.hobbies(id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, content jsonb not null, status text not null default 'published', created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.skill_nodes(id uuid primary key default gen_random_uuid(),hobby_id uuid not null references public.hobbies(id),slug text unique not null,title text not null,content jsonb not null,status text not null default 'published',content_version int not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.node_prerequisites(node_id uuid references public.skill_nodes(id),prerequisite_node_id uuid references public.skill_nodes(id),group_key text not null default 'all',requirement_type text not null default 'all',primary key(node_id,prerequisite_node_id));
create table public.resources(id uuid primary key default gen_random_uuid(),slug text unique not null,content jsonb not null,status text not null default 'published');
create table public.gear_items(id uuid primary key default gen_random_uuid(),slug text unique not null,hobby_id uuid references public.hobbies(id),content jsonb not null,status text not null default 'published');
create table public.avatar_items(id uuid primary key default gen_random_uuid(),slug text unique not null,content jsonb not null,status text not null default 'published');
create table public.achievements(id uuid primary key default gen_random_uuid(),slug text unique not null,content jsonb not null,status text not null default 'published');
create table public.quest_templates(id uuid primary key default gen_random_uuid(),slug text unique not null,content jsonb not null,status text not null default 'published');
create table public.node_resources(node_id uuid references public.skill_nodes(id),resource_id uuid references public.resources(id),sort_order int default 0,primary key(node_id,resource_id));
create table public.node_gear_requirements(node_id uuid references public.skill_nodes(id),gear_item_id uuid references public.gear_items(id),requirement text not null,primary key(node_id,gear_item_id));
create table public.progress_snapshots(user_id uuid primary key references auth.users(id) on delete cascade,state jsonb not null,revision bigint not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.profiles(user_id uuid primary key references auth.users(id) on delete cascade,display_name text not null,onboarding_complete boolean not null default false,reduced_motion boolean not null default false,sound_enabled boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.xp_ledger(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,hobby_id uuid references public.hobbies(id),source_type text not null,source_id text not null,amount integer not null check(amount>=0),idempotency_key text not null,metadata jsonb not null default '{}',created_at timestamptz not null default now(),unique(user_id,idempotency_key));
create table public.node_progress(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,node_id uuid not null references public.skill_nodes(id),status text not null,started_at timestamptz,completed_at timestamptz,mastered_at timestamptz,evidence jsonb,content_version_completed int,unique(user_id,node_id));
-- Additional private projections keep export and future editorial/reporting work straightforward.
create table public.hobby_enrollments(user_id uuid references auth.users(id) on delete cascade,hobby_id uuid references public.hobbies(id),is_active boolean not null default true,enrolled_at timestamptz default now(),primary key(user_id,hobby_id));
create table public.user_quests(user_id uuid references auth.users(id) on delete cascade,quest_template_id uuid references public.quest_templates(id),period_start date not null,payload jsonb not null,primary key(user_id,quest_template_id,period_start));
create table public.practice_logs(id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,payload jsonb not null,created_at timestamptz default now());
create table public.user_gear(user_id uuid references auth.users(id) on delete cascade,gear_item_id uuid references public.gear_items(id),status text not null,primary key(user_id,gear_item_id));
create table public.avatar_profiles(user_id uuid primary key references auth.users(id) on delete cascade,selected_items jsonb not null,updated_at timestamptz default now());
create table public.user_avatar_unlocks(user_id uuid references auth.users(id) on delete cascade,avatar_item_id uuid references public.avatar_items(id),unlocked_at timestamptz default now(),primary key(user_id,avatar_item_id));
create table public.user_achievements(user_id uuid references auth.users(id) on delete cascade,achievement_id uuid references public.achievements(id),earned_at timestamptz default now(),primary key(user_id,achievement_id));
create table public.activity_events(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,event_key text not null,payload jsonb not null,occurred_at timestamptz default now(),unique(user_id,event_key));
-- All user data is read-only to clients. Mutations use the authenticated server + RPC.
do $$ declare t text; begin
 foreach t in array array['progress_snapshots','profiles','xp_ledger','node_progress','hobby_enrollments','user_quests','practice_logs','user_gear','avatar_profiles','user_avatar_unlocks','user_achievements','activity_events'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy own_rows on public.%I for select to authenticated using (user_id = (select auth.uid()))',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
 foreach t in array array['hobbies','skill_nodes','resources','gear_items','avatar_items','achievements','quest_templates'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy published_content on public.%I for select to anon, authenticated using (status = ''published'')',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to anon, authenticated',t);
 end loop;
 foreach t in array array['node_prerequisites','node_resources','node_gear_requirements'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy published_links on public.%I for select to anon, authenticated using (exists(select 1 from public.skill_nodes n where n.id = node_id and n.status = ''published''))',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to anon, authenticated',t);
 end loop;
end $$;
create or replace function public.commit_progress(p_user_id uuid,p_expected_revision bigint,p_state jsonb) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare current_revision bigint; entry jsonb; kv record;
begin
 -- Serializes first-write races as well as existing-row updates.
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 select revision into current_revision from public.progress_snapshots where user_id=p_user_id for update;
 if coalesce(current_revision,0) <> p_expected_revision then return false; end if;
 insert into public.progress_snapshots(user_id,state,revision) values(p_user_id,p_state,1)
 on conflict(user_id) do update set state=excluded.state,revision=progress_snapshots.revision+1,updated_at=now();
 insert into public.profiles(user_id,display_name,onboarding_complete,reduced_motion,sound_enabled)
 values(p_user_id,p_state#>>'{profile,name}',(p_state#>>'{profile,onboardingComplete}')::boolean,(p_state#>>'{profile,reducedMotion}')::boolean,(p_state#>>'{profile,sound}')::boolean)
 on conflict(user_id) do update set display_name=excluded.display_name,onboarding_complete=excluded.onboarding_complete,reduced_motion=excluded.reduced_motion,sound_enabled=excluded.sound_enabled,updated_at=now();
 for entry in select value from jsonb_array_elements(p_state->'ledger') loop
 insert into public.xp_ledger(user_id,hobby_id,source_type,source_id,amount,idempotency_key,created_at)
 values(p_user_id,(select id from public.hobbies where slug=entry->>'hobbyId'),split_part(entry->>'id',':',1),entry->>'id',(entry->>'amount')::integer,entry->>'id',(entry->>'at')::timestamptz) on conflict(user_id,idempotency_key) do nothing;
 end loop;
 for kv in select * from jsonb_each(p_state->'progress') loop
 insert into public.node_progress(user_id,node_id,status,started_at,completed_at,mastered_at,evidence,content_version_completed)
 values(p_user_id,(select id from public.skill_nodes where slug=kv.key),kv.value->>'status',(kv.value->>'startedAt')::timestamptz,(kv.value->>'completedAt')::timestamptz,(kv.value->>'masteredAt')::timestamptz,kv.value->'evidence',(kv.value->>'contentVersion')::int)
 on conflict(user_id,node_id) do update set status=excluded.status,completed_at=excluded.completed_at,mastered_at=excluded.mastered_at,evidence=excluded.evidence,content_version_completed=excluded.content_version_completed;
 end loop;
 for entry in select value from jsonb_array_elements(p_state->'enrollments') loop
 insert into public.hobby_enrollments(user_id,hobby_id) values(p_user_id,(select id from public.hobbies where slug=entry#>>'{}')) on conflict do nothing;
 end loop;
 for kv in select * from jsonb_each(p_state->'quests') loop
 insert into public.user_quests(user_id,quest_template_id,period_start,payload) values(p_user_id,(select id from public.quest_templates where slug=kv.key),(kv.value->>'period')::date,kv.value)
 on conflict(user_id,quest_template_id,period_start) do update set payload=excluded.payload;
 end loop;
 for entry in select value from jsonb_array_elements(p_state->'practice') loop
 insert into public.practice_logs(id,user_id,payload) values((entry->>'id')::uuid,p_user_id,entry) on conflict do nothing;
 end loop;
 for kv in select * from jsonb_each_text(p_state->'gear') loop
 insert into public.user_gear(user_id,gear_item_id,status) values(p_user_id,(select id from public.gear_items where slug=kv.key),kv.value) on conflict(user_id,gear_item_id) do update set status=excluded.status;
 end loop;
 insert into public.avatar_profiles(user_id,selected_items) values(p_user_id,p_state->'avatar') on conflict(user_id) do update set selected_items=excluded.selected_items,updated_at=now();
 for entry in select value from jsonb_array_elements(p_state->'achievements') loop
 insert into public.user_achievements(user_id,achievement_id) values(p_user_id,(select id from public.achievements where slug=entry#>>'{}')) on conflict do nothing;
 end loop;
 for entry in select value from jsonb_array_elements(p_state->'activity') loop
 insert into public.activity_events(user_id,event_key,payload,occurred_at) values(p_user_id,entry->>'id',entry,(entry->>'at')::timestamptz) on conflict do nothing;
 end loop;
 insert into public.user_avatar_unlocks(user_id,avatar_item_id)
 select p_user_id,a.id from public.avatar_items a where
 case when a.content ? 'achievement' then (p_state->'achievements') ? (a.content->>'achievement')
 when a.content ? 'hobbyId' then coalesce((select sum((l->>'amount')::numeric) from jsonb_array_elements(p_state->'ledger') l where l->>'hobbyId'=a.content->>'hobbyId'),0) >= (array[0,100,300,650,1100,1700,2500,3500,4800,6400,8500])[(a.content->>'level')::int+1]
 else floor(sqrt(coalesce((select sum((l->>'amount')::numeric) from jsonb_array_elements(p_state->'ledger') l),0)/250))+1 >= coalesce((a.content->>'level')::int,0) end
 on conflict do nothing;
 return true;
end $$;
revoke all on function public.commit_progress(uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.commit_progress(uuid,bigint,jsonb) to service_role;
