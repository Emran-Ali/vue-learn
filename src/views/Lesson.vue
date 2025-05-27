<script setup lang="ts">
import { ref } from 'vue'
import { useStreamStore } from '../store/stream-store'
import VideoChat from './VideoChat.vue'

const streamStore = useStreamStore()

const hasUser = ref(false)
// const token = ref<null | { streamToken: string }>(null)
const user = ref<any>(null)
const email = ref('')
const password = ref('')

const submit = async () => {
  const result = await streamStore.login(email.value, password.value)
  const authUser = await streamStore.authUser()

  console.log(authUser)

  user.value = authUser
  console.log(user.value)

  user.value.streamToken = result?.streamToken

  console.log('user after fetch', user.value)

  hasUser.value = true
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-green-400 mb-4">Lesson Call test</h1>
    <hr class="mb-4 border-4 text-green-300" />

    <div v-if="!hasUser">
      <form @submit.prevent="submit">
        <input class="border border-2 m-2" type="text" v-model="email" />
        <input class="border border-2 m-2" type="text" v-model="password" />
        <br />
        <button type="submit" class="p-2 border border-2 rounded-lg">Get User Info</button>
      </form>
    </div>

    <VideoChat v-if="hasUser" :userInfo="user" />
  </div>
</template>
