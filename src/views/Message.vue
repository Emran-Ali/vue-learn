<script setup lang="ts">
import { StreamChat } from 'stream-chat'
import { onMounted, ref, onUnmounted } from 'vue'
import Chat from '@/components/ChatComponents/Chat.vue' // Update this path to where your Message.vue is located
import { useRouter } from 'vue-router'

const router = useRouter()
const apiKey = import.meta.env.VITE_STREAM_API_KEY
const client = ref<StreamChat | undefined>(undefined)
const isConnecting = ref(true)
const error = ref('')

// Get user details from localStorage
const token = localStorage.getItem('streamToken') ?? ''
const userId = localStorage.getItem('user') ?? ''

if (!apiKey || !token || !userId) {
  router.push('/login')
}

const initializeChat = async () => {
  try {
    client.value = new StreamChat(apiKey)

    // Connect the user
    await client.value.connectUser(
      {
        id: userId,
        name: userId, // You might want to store/use actual user name
      },
      token,
    )

    console.log('Successfully connected to Stream Chat  ')
  } catch (err) {
    console.error('Error connecting to Stream:', err)
    error.value = 'Failed to connect to chat'
    router.push('/login')
  } finally {
    isConnecting.value = false
  }
}

onMounted(() => {
  initializeChat()
})

onUnmounted(() => {
  // Cleanup: disconnect the client when component is unmounted
  if (client.value) {
    client.value.disconnectUser()
  }
})
</script>

<template>
  <div class="bg-[#E5E7EB]">
    <div class="container p-4 mx-auto overflow-hidden">
      <div v-if="isConnecting" class="text-center">Loading chat...</div>
      <div v-else-if="error" class="text-red-500 text-center">
        {{ error }}
      </div>
      <Chat v-else-if="client" :client="client" />
    </div>
  </div>
</template>
