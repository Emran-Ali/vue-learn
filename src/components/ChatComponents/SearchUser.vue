<template>
  <div class="relative py-2" ref="selectRef">
    <!-- Search Input -->
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleInput"
        :placeholder="placeholder"
        class="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Dropdown Options -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen && filteredUsers.length > 0"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        <ul class="py-1">
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
            :class="{
              'bg-blue-100': selectedUserId === user.id,
            }"
          >
            <div class="flex items-center">
              <!-- User Avatar if available -->
              <img
                v-if="user.image"
                :src="user.image"
                :alt="user.name || user.id"
                class="w-8 h-8 rounded-full mr-3"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center"
              >
                {{ (user.name || user.id).charAt(0).toUpperCase() }}
              </div>

              <!-- User Info -->
              <div>
                <div class="font-medium">{{ user.name || user.id }}</div>
                <div v-if="user.online" class="text-xs text-green-500">Online</div>
                <div v-else class="text-xs text-gray-400">Offline</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Loading state -->
    <div
      v-if="isOpen && isLoading"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-center"
    >
      Loading users...
    </div>

    <!-- No results message -->
    <div
      v-if="isOpen && !isLoading && filteredUsers.length === 0 && searchQuery"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-center"
    >
      No users found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { StreamChat, UserResponse } from 'stream-chat'

interface Props {
  client: StreamChat
  placeholder?: string
  modelValue?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for a user...',
  modelValue: null,
})

const emit = defineEmits<{
  'update:modelValue': [userId: string | null]
  'user-selected': [user: UserResponse]
}>()

// State
const users = ref<UserResponse[]>([])
const searchQuery = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const selectedUserId = ref<string | null>(props.modelValue)
const selectRef = ref<HTMLElement>()

// Computed
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter((user) => {
    const userName = (user.name || user.id || '').toLowerCase()
    return userName.includes(query)
  })
})

// Methods
const loadUsers = async () => {
  if (!props.client) return

  isLoading.value = true
  try {
    const response = await props.client.queryUsers(
      {
        banned: false,
        // role: 'user',
      },
      {
        name: 1,
        last_active: -1,
      },
      {
        limit: 100,
      },
    )
    users.value = response.users
  } catch (error) {
    console.error('Error loading users:', error)
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const handleInput = () => {
  isOpen.value = true

  // Optional: Debounced search if you want to query users based on search
  // You can implement a debounced API call here to search users
}

const selectUser = (user: UserResponse) => {
  selectedUserId.value = user.id
  searchQuery.value = user.name || user.id
  isOpen.value = false

  // Emit events
  emit('update:modelValue', user.id)
  emit('user-selected', user)
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
    // Reset search if no selection was made
    if (!selectedUserId.value) {
      searchQuery.value = ''
    }
  }
}

// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadUsers()

  // Set initial display value if modelValue is provided
  if (props.modelValue) {
    const user = users.value.find((u) => u.id === props.modelValue)
    if (user) {
      searchQuery.value = user.name || user.id
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for external modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedUserId.value = newValue
    if (newValue) {
      const user = users.value.find((u) => u.id === newValue)
      if (user) {
        searchQuery.value = user.name || user.id
      }
    } else {
      searchQuery.value = ''
    }
  },
)
</script>
