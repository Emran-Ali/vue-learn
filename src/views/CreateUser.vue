<template>
  <div class="container max-w-lg mx-auto p-4">
    <h1 class="text-2xl font-bold text-indigo-600 mb-4">Log In to Messaging App</h1>
    <hr class="mb-4 border-4 text-indigo-600" />
    <form @submit.prevent="handleSubmit">
      <div class="mb-4 text-cyan-700">
        <label for="id" class="block text-cyan-900 text-sm font-bold mb-2">ID:</label>
        <input
          type="text"
          id="id"
          v-model="user.id"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-cyan-900 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div class="mb-4">
        <label for="name" class="block text-cyan-900 text-sm font-bold mb-2">Name:</label>
        <input
          type="text"
          id="name"
          v-model="user.name"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-cyan-900 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div class="mb-4">
        <label for="role" class="block text-cyan-900 text-sm font-bold mb-2">Role:</label>
        <select
          id="role"
          v-model="user.role"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-cyan-900 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select Role</option>
          <option value="TEACHER">Teacher</option>
          <option value="user">User</option>
          <!-- Add more roles as needed -->
        </select>
      </div>
      <div class="mb-4">
        <label for="image" class="block text-cyan-900 text-sm font-bold mb-2">Image URL:</label>
        <input
          type="text"
          id="image"
          v-model="user.image"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-cyan-900 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Create
      </button>
    </form>
    <div>
      Already have an account ?
      <span @click="handleLogIn" class="text-blue-600 px-3 cursor-pointer font-semibold"
        >Log In
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStreamStore } from '../store/stream-store'
import { useRouter } from 'vue-router'

const streamStore = useStreamStore()

const user = ref({
  id: '',
  name: '',
  role: '',
  image: '',
})

const router = useRouter()

const handleSubmit = async () => {
  console.log(user, 'streamStore submit')
  const res = await streamStore.createUser(user.value)
}

const handleLogIn = async () => {
  await router.push('/login')
}
</script>
