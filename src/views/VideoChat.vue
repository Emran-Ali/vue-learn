<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { StreamVideoClient, type User, type StreamVideoParticipant } from '@stream-io/video-client'
import { renderControls } from '../utils/Controls'
import {
  renderAudioDeviceSelector,
  renderAudioOutputSelector,
  renderVideoDeviceSelector,
  renderVolumeControl,
} from '../utils/DiviceSelector'
import { isMobile } from '../utils/Mobile'
import { ClosedCaptionManager } from '../utils/CloseCaption'
import VideoParticipant from '../components/VideoParticipant.vue'

interface UserInfo {
  userId: string
  token: string
  channelId: string
  apiKey: string
}
const props = defineProps<{
  userInfo: UserInfo
}>()

const apiKey = props.userInfo.apiKey
const token = props.userInfo.token
const user: User = { id: props.userInfo.userId }

const client = new StreamVideoClient({
  apiKey,
  token,
  user,
  options: { logLevel: 'info' },
})

const callId = props.userInfo.channelId
const call = client.call('default', callId)

call.screenShare.enableScreenShareAudio()
call.screenShare.setSettings({
  maxFramerate: 10,
  maxBitrate: 1500000,
})

let closedCaptionManager: ClosedCaptionManager
const participants = ref<StreamVideoParticipant[]>([])
const participantsRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const container = document.getElementById('call-controls')!
  const captionContainer = document.getElementById('closed-captions')

  // render mic and camera controls
  const controls = renderControls(call)
  container.appendChild(controls.audioButton)
  container.appendChild(controls.videoButton)
  container.appendChild(controls.screenShareButton)

  container.appendChild(renderAudioDeviceSelector(call))

  // render device selectors
  if (isMobile.any()) {
    container.appendChild(controls.flipButton)
  } else {
    container.appendChild(renderVideoDeviceSelector(call))
  }

  const audioOutputSelector = renderAudioOutputSelector(call)
  if (audioOutputSelector) {
    container.appendChild(audioOutputSelector)
  }

  container.appendChild(renderVolumeControl(call))

  call.join({ create: true }).then(() => {
    call.camera.enable()
    call.microphone.enable()
  })

  // Set the viewport to our ref element
  if (participantsRef.value) {
    call.setViewport(participantsRef.value)
  }

  // Subscribe to participants changes
  call.state.participants$.subscribe((newParticipants) => {
    participants.value = newParticipants
  })
})

onBeforeUnmount(() => {
  call.leave()
  call.endCall()
})
</script>

<template>
  <div class="video-chat">
    <div ref="participantsRef" id="participants" class="participants-container">
      <VideoParticipant
        v-for="participant in participants"
        :key="participant.sessionId"
        :participant="participant"
        :call="call"
      />
    </div>
    <div id="call-controls" class="controls-container"></div>
  </div>
</template>

<style>
.video-chat {
  width: 100%;
  height: 100%;
}

.controls-container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
}

.participants-container {
  border: 1px solid greenyellow;
  border-radius: 9px;
}

.control-button {
  border-radius: 9999px;
  background-color: greenyellow;
  border: none;
  padding: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
