<template>
  <div class="max-w-md mx-auto p-4 shadow-md mt-10 bg-white rounded">
    <h2 class="text-lg font-bold mb-4">Create User</h2>
    <hr class="h-2 bg-lime-400 mb-3" />
    <form @submit.prevent="handleSubmit">
      <div class="mb-4 text-cyan-700">
        <label for="id" class="block text-cyan-900 text-sm font-bold mb-2">ID:</label>
        <input
          type="text"
          id="id"
          v-model="user.userId"
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStreamStore } from '../store/stream-store'

const streamStore = useStreamStore()

const user = ref({
  userId: '',
  name: '',
  role: '',
  image: '',
})

const handleSubmit = () => {
  const res = streamStore.createUser(user)
  console.log(res)
}
</script>
