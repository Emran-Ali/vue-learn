<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { StreamVideoClient, type User } from '@stream-io/video-client'
import { cleanupParticipant, renderParticipant } from '../utils/Participents'
import { renderControls } from '../utils/Controls'
import {
  renderAudioDeviceSelector,
  renderAudioOutputSelector,
  renderVideoDeviceSelector,
  renderVolumeControl,
} from '../utils/DiviceSelector'
import { isMobile } from '../utils/Mobile'
import { ClosedCaptionManager } from '../utils/CloseCaption'

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

await call.getOrCreate({
  data: {
    members: [{ user_id: 'emran', role: 'admin' }, { user_id: 'rayhan' }, { user_id: 'sohan' }],
  },
})
call.screenShare.enableScreenShareAudio()
call.screenShare.setSettings({
  maxFramerate: 10,
  maxBitrate: 1500000,
})

let closedCaptionManager: ClosedCaptionManager

onMounted(() => {
  const container = document.getElementById('call-controls')!
  const parentContainer = document.getElementById('participants')!
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

  // Closed caption controls
  closedCaptionManager = new ClosedCaptionManager(call)
  container.appendChild(closedCaptionManager.renderToggleElement())

  if (captionContainer) {
    captionContainer.appendChild(closedCaptionManager.renderCaptionContainer())
  }

  call.join({ create: true }).then(() => {
    call.camera.enable()
    call.microphone.enable()
  })

  call.setViewport(parentContainer)

  call.state.participants$.subscribe((participants) => {
    // render / update existing participants
    participants.forEach((participant) => {
      renderParticipant(call, participant, parentContainer)
    })

    // Remove stale elements for stale participants
    parentContainer.querySelectorAll<HTMLMediaElement>('video, audio').forEach((el) => {
      const sessionId = el.dataset.sessionId!
      const participant = participants.find((p) => p.sessionId === sessionId)
      if (!participant) {
        cleanupParticipant(sessionId)
        el.remove()
      }
    })
  })
})

onBeforeUnmount(() => {
  call.leave()
})
</script>

<template>
  <div class="video-chat">
    <div id="participants" class="participants-container"></div>
    <div id="closed-captions" class="captions-container"></div>
    <div id="call-controls" class="controls-container"></div>
  </div>
</template>

<style scoped>
.video-chat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.controls-container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
}

.participants-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.captions-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  max-width: 80%;
}
</style>
