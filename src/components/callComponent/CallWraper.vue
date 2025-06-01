<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from 'vue'
import { StreamVideoClient, type User } from '@stream-io/video-client'
import { useRouter } from 'vue-router'

const apiKey = import.meta.env.VITE_STREAM_API_KEY
const token = localStorage.getItem('streamToken') ?? undefined
const userId = localStorage.getItem('user') ?? ''
const user: User = { id: userId }

const router = useRouter()

if (!apiKey || !token || !userId) {
  router.push('/login')
}

const client = ref<StreamVideoClient | null>(null)

// Initialize Stream client
const initializeClient = async () => {
  try {
    client.value = new StreamVideoClient({
      apiKey,
      token,
      user,
      options: { logLevel: 'info' },
    })
  } catch (error) {
    console.error('Failed to initialize Stream client:', error)
  }
}
provide('streamClient', client)

// Lifecycle
onMounted(() => {
  initializeClient()
})

onUnmounted(() => {
  subscription?.unsubscribe()
  client.value?.disconnectUser()
})
</script>

<template>
  <div class="call-wrapper">
    <slot :client="client" />
  </div>
</template>

<style scoped></style>
