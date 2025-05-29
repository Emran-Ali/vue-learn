<template>
  <div v-if="call" class="str-video__call-panel str-video__call-panel--ringing">
    <div class="str-video__call-panel__members-list">
      <div v-for="user in membersToShow" :key="user.id" class="str-video__call-panel__member-box">
        <Avatar :name="user.name" :image-src="user.image" />
        <div v-if="user.name" class="str-video__member_details">
          <span class="str-video__member_name">{{ user.name }}</span>
        </div>
      </div>
    </div>

    <div v-if="callingStateLabel" class="str-video__call-panel__calling-state-label">
      {{ callingStateLabel }}
    </div>

    <RingingCallControls
      v-if="[CallingState.RINGING, CallingState.JOINING].includes(callingState)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { CallingState, type UserResponse, Call, StreamVideoClient } from '@stream-io/video-client'
import Avatar from '../Avatar.vue'
import RingingCallControls from './RingingCallControls.vue'

export interface RingingCallProps {
  /**
   * Whether to include the current user in the list of members to show.
   * @default false.
   */
  includeSelf?: boolean

  /**
   * The maximum number of members to show.
   * @default 3.
   */
  totalMembersToShow?: number
}

const props = withDefaults(defineProps<RingingCallProps>(), {
  includeSelf: false,
  totalMembersToShow: 3,
})

const CALLING_STATE_TO_LABEL: Record<CallingState, string> = {
  [CallingState.JOINING]: 'Joining',
  [CallingState.RINGING]: 'Ringing',
  [CallingState.MIGRATING]: 'Migrating',
  [CallingState.RECONNECTING]: 'Re-connecting',
  [CallingState.RECONNECTING_FAILED]: 'Failed',
  [CallingState.OFFLINE]: 'No internet connection',
  [CallingState.IDLE]: '',
  [CallingState.UNKNOWN]: '',
  [CallingState.JOINED]: 'Joined',
  [CallingState.LEFT]: 'Left call',
}

const call = inject<Call>('call')

const client = inject<StreamVideoClient>('streamClient')

client?.state.calls$.subscribe((calls) => {
  const incomingCalls = calls.filter(
    (call) => call.isCreatedByMe === false && call.state.callingState === CallingState.RINGING,
  )
  console.log('Incoming calls', incomingCalls)
  const outgoingCalls = calls.filter(
    (call) => call.isCreatedByMe === true && call.state.callingState === CallingState.RINGING,
  )
  console.log('Outgoing calls', outgoingCalls)
})

if (!call) {
  return
}

const { callingState$ } = call.state

const callingState = callingState$.subscribe((state) => {
  console.log('Calling state changed:', state)
})

const membersToShow = computed<UserResponse[]>(() => {
  if (!members.value) return []

  // take the first N members to show their avatars
  let membersArray: UserResponse[] = members.value
    .slice(0, props.totalMembersToShow)
    .map(({ user }) => user)
    .filter((user) => user.id !== connectedUser.value?.id || props.includeSelf)

  if (props.includeSelf && !membersArray.find((user) => user.id === connectedUser.value?.id)) {
    // if the current user is not in the initial batch of members,
    // replace the first item in membersToShow array with the current user
    const self = members.value.find(({ user }) => user.id === connectedUser.value?.id)
    if (self) {
      membersArray = [...membersArray]
      membersArray.splice(0, 1, self.user)
    }
  }

  return membersArray
})

const callingStateLabel = computed(() => CALLING_STATE_TO_LABEL[callingState.value])
</script>
