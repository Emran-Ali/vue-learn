<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { StreamVideoClient, type User, type StreamVideoParticipant } from '@stream-io/video-client'
import { isMobile } from '../utils/Mobile'
import { ClosedCaptionManager } from '../utils/CloseCaption'
import VideoParticipant from '../components/VideoParticipant.vue'
import CallControls from '../components/CallControls.vue'

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
const captionContainerRef = ref<HTMLElement | null>(null)
const connectionStatus = ref<'connected' | 'disconnected' | 'reconnecting'>('connected')

onMounted(() => {
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

const handleCaptionContainer = (element: HTMLElement) => {
  const captionContainer = document.getElementById('closed-captions')
  if (captionContainer) {
    captionContainer.appendChild(element)
  }
}

const handleConnectionStatus = (status: 'connected' | 'disconnected' | 'reconnecting') => {
  connectionStatus.value = status
  console.log('Connection status changed:', status)

  // You could show a notification or take other actions based on connection status
}

onBeforeUnmount(() => {
  call.leave()
  call.endCall()
})
</script>

<template>
  <div class="video-chat">
    <!-- Connection status notification -->
    <div
      v-if="connectionStatus !== 'connected'"
      class="connection-notification"
      :class="connectionStatus"
    >
      {{
        connectionStatus === 'reconnecting'
          ? 'Reconnecting to call...'
          : 'Connection lost. Trying to reconnect...'
      }}
    </div>

    <div ref="participantsRef" id="participants" class="participants-container">
      <VideoParticipant
        v-for="participant in participants"
        :key="participant.sessionId"
        :participant="participant"
        :call="call"
      />
    </div>
    <div id="closed-captions" class="captions-container"></div>
    <CallControls
      :call="call"
      @caption-container="handleCaptionContainer"
      @connection-status="handleConnectionStatus"
    />
  </div>
</template>

<style scoped>
.video-chat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.connection-notification {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  z-index: 100;
}

.connection-notification.reconnecting {
  background-color: #f39c12;
  animation: pulse 1.5s infinite;
}

.connection-notification.disconnected {
  background-color: #e74c3c;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
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
