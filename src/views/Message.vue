<script setup lang="ts">
import { StreamChat } from 'stream-chat'
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Chat from '@/components/Message/Chat.vue'

const router = useRouter()
const apiKey = import.meta.env.VITE_STREAM_API_KEY
const client = ref<StreamChat | undefined>(undefined)

// Get user details from localStorage
const token = localStorage.getItem('streamToken') ?? ''
const userId = localStorage.getItem('user') ?? ''

if (!apiKey || !token || !userId) {
  router.push('/login')
}

onMounted(() => {
  client.value = new StreamChat(apiKey)
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
      <Chat v-if="client" :client="client" :user-id="userId" />
      <div v-else class="mx-auto text-lg text-gray-400">Nothings here</div>
    </div>
  </div>
</template>
