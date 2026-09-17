-- Keep normalized cosmetic unlocks and active hobbies aligned with the authoritative snapshot.
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
 delete from public.hobby_enrollments where user_id=p_user_id and hobby_id not in (select id from public.hobbies where (p_state->'enrollments') ? slug);
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
 case when a.content ? 'rewardNode' then (p_state->'progress'->(a.content->>'rewardNode')->>'status') in ('completed','mastered')
 when a.content ? 'achievement' then (p_state->'achievements') ? (a.content->>'achievement')
 when a.content ? 'hobbyId' then coalesce((select sum((l->>'amount')::numeric) from jsonb_array_elements(p_state->'ledger') l where l->>'hobbyId'=a.content->>'hobbyId'),0) >= (array[0,100,300,650,1100,1700,2500,3500,4800,6400,8500])[(a.content->>'level')::int+1]
 else floor(sqrt(coalesce((select sum((l->>'amount')::numeric) from jsonb_array_elements(p_state->'ledger') l),0)/250))+1 >= coalesce((a.content->>'level')::int,0) end
 on conflict do nothing;
 return true;
end $$;
revoke all on function public.commit_progress(uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.commit_progress(uuid,bigint,jsonb) to service_role;
