<script setup lang="ts">
import { onMounted, reactive } from 'vue'
const state = reactive({
  blogs: [],
  loading: true,
  error: null,
})

onMounted(async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    state.blogs = data
  } catch (error) {
    state.error = error.message
  } finally {
    state.loading = false
  }
})
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-green-400 mb-4">Blogs</h1>
    <hr class="mb-4 border-4 text-green-300" />
    <div v-if="state.loading" class="text-center">Loading...</div>
    <div v-else-if="state.error" class="text-red-500 text-center">{{ state.error }}</div>
    <div v-else class="grid md:grid-cols-3 gap-4">
      <div
        v-for="blog in state.blogs"
        :key="blog.id"
        class="bg-blue-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
      >
        <div class="relative">
          <img
            src="https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-1170x780.jpg"
            alt="post.title"
            class="w-full h-48 object-cover"
          />
        </div>
        <div class="flex flex-col justify-between h-100">
          <div class="p-6">
            <h2
              class="text-xl font-bold text-gray-800 mb-2 hover:text-indigo-600 transition duration-300"
            >
              {{ blog.title }}
            </h2>
            <p class="text-gray-700 mb-4">{{ blog.body }}</p>
          </div>

          <!-- Meta Information -->

          <div class="p-6">
            <div class="flex items-center mb-4 text-gray-500">
              <!-- Author -->
              <div class="flex items-center">
                <img
                  src="https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-1170x780.jpg"
                  alt="Image"
                  class="w-6 h-6 rounded-full mr-2"
                />
                <span class="text-sm">{{ blog.author ?? 'No Author' }}</span>
              </div>

              <!-- Date -->
              <div class="flex items-center mx-4">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm">{{ blog.date }}</span>
              </div>

              <!-- Read Time -->
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm">{{ blog.readTime ?? 5 }} min read</span>
              </div>
            </div>

            <!-- Read More Button -->
            <button
              class="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition duration-300"
            >
              Read More
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
