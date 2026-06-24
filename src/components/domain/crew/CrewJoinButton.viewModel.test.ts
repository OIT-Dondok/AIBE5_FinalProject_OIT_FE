import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCrewJoinButtonState } from './CrewJoinButton.viewModel';

test('ACTIVE crew disables join for non-participants', () => {
  assert.deepEqual(getCrewJoinButtonState('ACTIVE', null), {
    variant: 'DISABLED',
    label: '진행 중인 크루',
  });
  assert.deepEqual(getCrewJoinButtonState('ACTIVE', 'CANCELLED'), {
    variant: 'DISABLED',
    label: '진행 중인 크루',
  });
  assert.deepEqual(getCrewJoinButtonState('ACTIVE', 'PENDING'), {
    variant: 'DISABLED',
    label: '진행 중인 크루',
  });
});

test('ACTIVE crew keeps locked participants as participating', () => {
  assert.deepEqual(getCrewJoinButtonState('ACTIVE', 'LOCKED'), { variant: 'PARTICIPATING' });
});

test('terminal crew states override participation status', () => {
  assert.deepEqual(getCrewJoinButtonState('CLOSED', 'LOCKED'), {
    variant: 'DISABLED',
    label: '완료된 크루',
  });
  assert.deepEqual(getCrewJoinButtonState('CANCELLED', 'LOCKED'), {
    variant: 'DISABLED',
    label: '해체된 크루',
  });
  assert.deepEqual(getCrewJoinButtonState('CANCELLED', 'PENDING'), {
    variant: 'DISABLED',
    label: '해체된 크루',
  });
});

test('RECRUITING crew keeps existing participation states', () => {
  assert.deepEqual(getCrewJoinButtonState('RECRUITING', null), { variant: 'JOIN' });
  assert.deepEqual(getCrewJoinButtonState('RECRUITING', 'CANCELLED'), { variant: 'JOIN' });
  assert.deepEqual(getCrewJoinButtonState('RECRUITING', 'PENDING'), { variant: 'PENDING' });
  assert.deepEqual(getCrewJoinButtonState('RECRUITING', 'LOCKED'), { variant: 'PARTICIPATING' });
});
