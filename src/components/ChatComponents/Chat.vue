<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import type { StreamChat, Channel, Event, MessageResponse } from 'stream-chat'
import SearchUser from '@/components/ChatComponents/SearchUser.vue'
import MessageInput from '@/components/ChatComponents/MessageInput.vue'
import ChatMessage from '@/components/ChatComponents/ChatMessage.vue'

const props = defineProps<{ client: StreamChat }>()

// State
const channels = ref<Channel[]>([])
const selectedChannel = ref<Channel | null>(null)
const loadingChannels = ref(true)
const typingUsers = ref<{ [key: string]: string }>({})
const typingTimeout = ref<{ [key: string]: any }>({})
const urlPreviews = ref<{ [key: string]: any }>({})
const isLoadingUrlPreview = ref(false)
const selectedUserId = ref<string | null>(null)
const error = ref<string | null>(null)

// Constants
const userId = localStorage.getItem('user') ?? ''
const URL_PATTERN =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi

// Computed
const typingText = computed(() => {
  const userIds = Object.keys(typingUsers.value).filter((id) => id !== userId)

  if (userIds.length === 0) return ''
  if (userIds.length === 1) return `${typingUsers.value[userIds[0]]} is typing...`
  if (userIds.length === 2)
    return `${typingUsers.value[userIds[0]]} and ${typingUsers.value[userIds[1]]} are typing...`

  return 'Several people are typing...'
})

// Channel management
const loadChannels = async () => {
  try {
    loadingChannels.value = true
    error.value = null

    const filter = { type: 'messaging', members: { $in: [userId] } }
    const sort = [{ last_message_at: -1 }]
    const options = { watch: true, state: true, presence: true }

    const response = await props.client.queryChannels(filter, sort, options)
    channels.value = response

    // Select first channel if available and no channel is selected
    if (response.length > 0 && !selectedChannel.value) {
      await selectChannel(response[0])
    }
  } catch (err) {
    console.error('Error loading channels:', err)
    error.value = 'Failed to load channels'
  } finally {
    loadingChannels.value = false
  }
}

const selectChannel = async (channel: Channel) => {
  if (selectedChannel.value?.cid === channel.cid) return

  try {
    // Clear previous channel state
    typingUsers.value = {}
    clearAllTypingTimeouts()

    selectedChannel.value = channel
    await channel.watch()

    // Scroll to bottom after channel selection
    await nextTick()
  } catch (err) {
    console.error('Error selecting channel:', err)
    error.value = 'Failed to select channel'
  }
}

// User management
const handleUserSelected = async (user: any) => {
  try {
    const filter = {
      type: 'messaging',
      members: { $eq: [userId, user.id] },
    }

    const existingChannels = await props.client.queryChannels(filter, {}, {})
    let channel

    if (existingChannels.length === 0) {
      // Create new channel
      channel = props.client.channel('messaging', {
        members: [userId, user.id],
        name: user.name || user.id,
      })
      await channel.create()
    } else {
      channel = existingChannels[0]
    }

    await selectChannel(channel)
    await loadChannels() // Refresh channels list
  } catch (err) {
    console.error('Error creating or finding channel:', err)
    error.value = 'Failed to create or find channel'
  }
}

// Message handling
const handleSendMessage = async (payload: { text: string; file: File | null }) => {
  if (!selectedChannel.value) return

  try {
    const messageData: any = {
      text: payload.text,
    }

    // Handle file attachment
    if (payload.file) {
      messageData.attachments = [
        {
          type: payload.file.type.startsWith('image/') ? 'image' : 'file',
          file: payload.file,
          fallback: payload.file.name,
        },
      ]
    }

    await selectedChannel.value.sendMessage(messageData)
  } catch (err) {
    console.error('Error sending message:', err)
    error.value = 'Failed to send message'
  }
}

// Typing indicators
const handleTyping = () => {
  if (!selectedChannel.value) return

  selectedChannel.value.keystroke()
  startTyping()
}

const startTyping = () => {
  if (typingTimeout.value[userId]) {
    clearTimeout(typingTimeout.value[userId])
  }

  typingTimeout.value[userId] = setTimeout(() => {
    stopTyping()
  }, 3000)
}

const stopTyping = () => {
  if (!selectedChannel.value) return

  if (typingTimeout.value[userId]) {
    clearTimeout(typingTimeout.value[userId])
    delete typingTimeout.value[userId]
  }

  selectedChannel.value.stopTyping()
}

const clearAllTypingTimeouts = () => {
  Object.values(typingTimeout.value).forEach((timeout) => clearTimeout(timeout))
  typingTimeout.value = {}
}

// Event handlers
const handleTypingStart = (event: Event) => {
  if (!selectedChannel.value || event.cid !== selectedChannel.value.cid) return

  const user = event.user
  if (user.id !== userId) {
    typingUsers.value = { ...typingUsers.value, [user.id]: user.name || user.id }
  }
}

const handleTypingStop = (event: Event) => {
  if (!selectedChannel.value || event.cid !== selectedChannel.value.cid) return

  const user = event.user
  if (user.id !== userId && typingUsers.value[user.id]) {
    const newTypingUsers = { ...typingUsers.value }
    delete newTypingUsers[user.id]
    typingUsers.value = newTypingUsers
  }
}

const handleNewMessage = (event: any) => {
  // ChatMessage component will handle message updates via channel watching
  console.log('New message received:', event.message)
}

const handleConnectionChanged = (event: any) => {
  if (event.online === false) {
    error.value = 'Connection lost'
  } else if (event.online === true && error.value === 'Connection lost') {
    error.value = null
  }
}

// Lifecycle
onMounted(async () => {
  console.log('Chat component mounted, initializing...')

  // Register event listeners
  props.client.on('message.new', handleNewMessage)
  props.client.on('typing.start', handleTypingStart)
  props.client.on('typing.stop', handleTypingStop)
  props.client.on('connection.changed', handleConnectionChanged)

  await loadChannels()
  console.log('Chat component initialized successfully')
})

onUnmounted(() => {
  // Cleanup event listeners
  props.client.off('message.new', handleNewMessage)
  props.client.off('typing.start', handleTypingStart)
  props.client.off('typing.stop', handleTypingStop)
  props.client.off('connection.changed', handleConnectionChanged)

  // Clear all timeouts
  clearAllTypingTimeouts()
})

// Error handling
const dismissError = () => {
  error.value = null
}
</script>

<template>
  <div class="grid grid-cols-4 gap-3 mx-auto">
    <!-- Error notification -->
    <div v-if="error" class="col-span-4 mb-4">
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center"
      >
        <span>{{ error }}</span>
        <button @click="dismissError" class="text-red-700 hover:text-red-900">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Channels List -->
    <div class="rounded-xl shadow-2xl border border-gray-300 p-4 h-full overflow-y-auto bg-white">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Chats</h2>

      <SearchUser
        :client="props.client"
        v-model="selectedUserId"
        @user-selected="handleUserSelected"
        placeholder="Search for a user..."
        class="mb-4"
      />

      <div v-if="loadingChannels" class="text-center text-gray-500 py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p class="mt-2">Loading channels...</p>
      </div>

      <div v-else-if="channels.length === 0" class="text-center text-gray-500 py-4">
        No chats found
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="channel in channels"
          :key="channel.cid"
          @click="selectChannel(channel)"
          class="p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors duration-200"
          :class="{ 'bg-blue-50 border border-blue-200': selectedChannel?.cid === channel.cid }"
        >
          <div class="font-medium text-gray-800 truncate">
            {{ channel.data?.name || 'Unnamed Channel' }}
          </div>
          <div class="text-sm text-gray-500">{{ channel.data?.member_count || 0 }} members</div>
          <div v-if="channel.state?.last_message_at" class="text-xs text-gray-400">
            {{ new Date(channel.state.last_message_at).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div
      class="rounded-xl shadow-2xl border border-gray-300 max-h-full bg-white col-span-2 flex flex-col"
    >
      <!-- Channel Header -->
      <div v-if="selectedChannel" class="border-b border-gray-200 p-4">
        <h2 class="text-xl font-bold text-gray-800">
          {{ selectedChannel.data?.name || 'Unnamed Channel' }}
        </h2>
        <div v-if="typingText" class="text-sm text-gray-500 animate-pulse">
          {{ typingText }}
        </div>
      </div>

      <div v-if="!selectedChannel" class="flex-1 flex items-center justify-center text-gray-500">
        Select a channel to start chatting
      </div>

      <!-- Messages Area -->
      <div v-else class="flex-1 flex flex-col min-h-0">
        <ChatMessage :channel="selectedChannel" class="flex-1" />
        <MessageInput
          :channel="selectedChannel"
          @send-message="handleSendMessage"
          @typing="handleTyping"
          @stop-typing="stopTyping"
        />
      </div>
    </div>

    <!-- Files and links panel -->
    <div class="rounded-xl shadow-2xl border border-gray-300 p-4 h-full overflow-y-auto bg-white">
      <h3 class="text-lg font-semibold mb-4 text-gray-800">Shared Content</h3>
      <div class="text-center text-gray-500 py-4">No shared content in this channel yet</div>
    </div>
  </div>
</template>
