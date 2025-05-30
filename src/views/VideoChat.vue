<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import {
  StreamVideoClient,
  type User,
  type StreamVideoParticipant,
  OwnCapability,
} from '@stream-io/video-client'
import { ClosedCaptionManager } from '../utils/CloseCaption'
import VideoParticipant from '../components/VideoParticipant.vue'
import CallControls from '../components/CallControls.vue'

const props = defineProps<{
  userInfo: any
}>()

const error1 = ref<any>(null)

console.log(props.userInfo, 'USER INFO FROM PROPS')

const apiKey = 'fmes3fcbxma6'
const token = props.userInfo.streamToken

const user = {
  id:
    props.userInfo.role === 'STUDENT'
      ? `student-${props.userInfo.id}`
      : `teacher-${props.userInfo.id}`,
}

console.log(apiKey, token, user, 'Client Info')

const client = new StreamVideoClient({
  apiKey,
  token,
  user,
  options: { logLevel: 'info' },
})

const call = client.call('classroom', 'lesson-6')

console.log(call)

// await call.getOrCreate({
//   data: {
//     settings_override: {
//       limits: {
//         max_duration_seconds: 3600,
//       },
//     },
//   },
// })

// const duration = call.state.settings?.limits.max_duration_seconds! + 60

// call.update({
//   settings_override: {
//     limits: {
//       max_duration_seconds: duration,
//     },
//   },
// })

const canScreenshare = call.permissionsContext.hasPermission(OwnCapability.SCREENSHARE)

if (canScreenshare) {
  call.screenShare.enableScreenShareAudio()
  call.screenShare.setSettings({
    maxFramerate: 10,
    maxBitrate: 1500000,
  })
}

let closedCaptionManager: ClosedCaptionManager
const participants = ref<StreamVideoParticipant[]>([])
const participantsRef = ref<HTMLElement | null>(null)
const captionContainerRef = ref<HTMLElement | null>(null)
const connectionStatus = ref<'connected' | 'disconnected' | 'reconnecting'>('connected')

onMounted(async () => {
  try {
    const join = await call.join().then(() => {
      call.camera.enable()
      call.microphone.enable()
    })
    console.log(join, 'Join info on mopunt ')
  } catch (error) {
    error1.value = error
    console.log(error)
  }

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
}

const handleLeaveCall = async () => {
  try {
    // Set connection status to disconnected
    connectionStatus.value = 'disconnected'

    // Disable camera and microphone
    await call.camera.disable()
    await call.microphone.disable()

    // Leave the call
    await call.leave()

    // End the call (if you're the host)
    try {
      await call.endCall()
    } catch (error) {
      console.log('Not the host or call already ended')
    }

    // Show confirmation that call has ended
    alert('You have left the call')

    // Navigate back to home or another page
    // router.push('/');
  } catch (error) {
    console.error('Error leaving call:', error)
  }
}

onBeforeUnmount(() => {
  // Update connection status before leaving
  connectionStatus.value = 'disconnected'
  call.leave()
  try {
    call.endCall()
  } catch (error) {
    console.log('Error ending call during unmount:', error)
  }
})
</script>

<template>
  <div v-if="error1 === null" class="video-chat">
    <!-- Connection status notification -->
    <div
      v-if="connectionStatus !== 'connected'"
      class="connection-notification"
      :class="connectionStatus"
    >
      {{
        connectionStatus === 'reconnecting'
          ? 'Reconnecting to call...'
          : connectionStatus === 'disconnected'
            ? 'Call ended'
            : 'Connection lost. Trying to reconnect...'
      }}
    </div>

    <!-- Show participants only if connected -->

    <div
      v-if="connectionStatus !== 'disconnected'"
      ref="participantsRef"
      id="participants"
      class="participants-container"
    >
      <VideoParticipant
        v-for="participant in participants"
        :key="participant.sessionId"
        :participant="participant"
        :call="call"
      />
    </div>
    <!-- Show call ended message if disconnected -->
    <div v-else class="call-ended-container">
      <h2>Call Ended</h2>
      <p>You have left the video call.</p>
    </div>

    <div id="closed-captions" class="captions-container"></div>
    <CallControls
      :call="call"
      @caption-container="handleCaptionContainer"
      @connection-status="handleConnectionStatus"
      @leave-call="handleLeaveCall"
    />
  </div>

  <div v-else class="h-60 w-full bg-cyan-700 text-white text-center">Opps error {{ error1 }}</div>
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

.call-ended-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  color: #333;
}

.call-ended-container h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
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
