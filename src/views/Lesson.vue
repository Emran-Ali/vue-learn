<script setup lang="ts">
import { ref } from 'vue'
import { useStreamStore } from '../store/stream-store'
import VideoChat from './VideoChat.vue'

const streamStore = useStreamStore()

const hasUser = ref(false)
const user = ref<null | { userId: string; token: string; apiKey: string; channelId: string }>(null)
const userId = ref('')

const submit = async () => {
  const result = await streamStore.getUser(userId.value)
  if (result) {
    user.value = result
    hasUser.value = true
  } else {
    hasUser.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-green-400 mb-4">Lesson Call test</h1>
    <hr class="mb-4 border-4 text-green-300" />

    <div v-if="!hasUser">
      <form @submit.prevent="submit">
        <input class="border border-2 m-2" type="text" v-model="userId" />
        <br />
        <button type="submit" class="p-2 border border-2 rounded-lg">Get User Info</button>
      </form>
    </div>

    <VideoChat v-if="user !== null" :userInfo="user" />
  </div>
</template>
