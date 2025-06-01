<template>
  <div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold text-green-400 mb-4">Get User Token</h1>
    <hr class="mb-4 border-4 text-green-300" />

    <form @submit.prevent="joinChat" method="post" class="uk-form-stacked">
      <div class="uk-margin-small-top uk-width-1-1@s">
        <label class="text-xl text-cyan-900 mb-2" for="username">User ID</label>
        <div class="uk-form-controls">
          <input
            id="username"
            class="border-b-cyan-900 border-2 rounded p-2"
            type="text"
            v-model.trim="userId"
            required
            placeholder="Enter your username"
          />
        </div>
      </div>

      <div class="uk-margin-top uk-width-1-1@s">
        <button
          type="submit"
          class="bg-cyan-800 text-white p-4 font-semibold m-2 rounded-lg"
        >
          Get Token
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStreamStore } from '@/store/stream-store.ts'

const userId = ref('')
const router = useRouter()
const streamStore = useStreamStore()

const  joinChat = async () => {
  if (!userId.value) {
    alert('User Id is required')
    return
  }
  const data = await streamStore.getStreamToken(userId.value)
  console.log(data)

  await router.push('/lesson-call')
}
</script>
