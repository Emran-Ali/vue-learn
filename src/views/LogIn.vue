<template>
  <div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold text-green-400 mb-4">Log In</h1>
    <hr class="mb-4 border-4 text-green-300" />

    <form @submit.prevent="joinChat" method="post" class="uk-form-stacked">
      <div class="uk-margin-small-top uk-width-1-1@s">
        <label class="uk-form-label" for="username">Username</label>
        <div class="uk-form-controls">
          <input
            id="username"
            class="uk-input"
            type="text"
            v-model.trim="username"
            required
            placeholder="Enter your username"
          />
        </div>
      </div>

      <div class="uk-margin-top uk-width-1-1@s">
        <button
          type="submit"
          class="uk-button uk-button-primary uk-width-1-1 uk-border-rounded uk-text-uppercase"
        >
          Join Chat
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const router = useRouter()

const joinChat = () => {
  if (!username.value) {
    alert('Username is required')
    return
  }

  // You can store the username in localStorage or Vuex if needed
  localStorage.setItem('chat_username', username.value)

  // Redirect to the chat page (make sure route exists)
  router.push({ name: 'ChatRoom' })
}
</script>
