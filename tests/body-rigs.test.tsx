import {it,expect} from 'vitest';
import {render} from '@testing-library/react';
import {Avatar} from '../components/avatar';
import {initialState,stateSchema,commandSchema} from '../lib/domain';
import {bodyRigIds,bodyRigs} from '../lib/body-rigs';
import {applyCommand} from '../lib/progression';
it('migrates existing characters without resetting clothing or progression',()=>{const s=initialState();const legacy=structuredClone(s) as unknown as {profile:Record<string,unknown>};delete legacy.profile.bodyRigId;const migrated=stateSchema.parse(legacy);expect(migrated.profile.bodyRigId).toBe('average-average');expect(migrated.avatar).toEqual(s.avatar);expect(commandSchema.parse({type:'profile',input:{name:'Ada'}})).toEqual({type:'profile',input:{name:'Ada'}});});
it('all nine bodies preserve equipment and gameplay, render complete layers and anchors',()=>{for(const bodyRigId of bodyRigIds){const s=initialState(),changed=applyCommand(s,{type:'profile',input:{bodyRigId}}).state;expect(changed.avatar).toEqual(s.avatar);expect(changed.ledger).toEqual(s.ledger);expect(Object.keys(bodyRigs[bodyRigId].anchors)).toHaveLength(12);const {container,unmount}=render(<Avatar bodyRigId={bodyRigId} selection={s.avatar}/>);expect(container.querySelector('svg')).toHaveAttribute('data-rig',bodyRigId);expect(container.querySelectorAll('[data-layer]')).toHaveLength(18);expect(container.querySelector('[data-layer=top] path')).toHaveAttribute('d',bodyRigs[bodyRigId].torso);unmount();}});
