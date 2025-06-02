<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { StreamChat, Channel } from 'stream-chat'

const props = defineProps<{ client: StreamChat }>()
const channels = ref<Channel[]>([])
const selectedChannel = ref<Channel | null>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const loadingChannels = ref(true)

// Get user details from localStorage
const userId = localStorage.getItem('user') ?? ''

const loadChannels = async () => {
  try {
    loadingChannels.value = true
    // Filter for messaging channels where the current user is a member
    const filter = { type: 'messaging', members: { $in: [userId] } }
    const sort = [{ last_message_at: -1 }]

    // Query and watch channels
    const response = await props.client.queryChannels(filter, sort, {
      watch: true,
      state: true,
      presence: true,
    })

    channels.value = response
    await selectChannel(response[0])
    loadingChannels.value = false
  } catch (error) {
    console.error('Error loading channels:', error)
    loadingChannels.value = false
  }
}

const selectChannel = async (channel: Channel) => {
  try {
    selectedChannel.value = channel

    await channel.watch()
    // Load messages
    const response = await channel.query({ messages: { limit: 30 } })
    messages.value = response.messages
  } catch (error) {
    console.error('Error selecting channel:', error)
  }
}

const sendMessage = async () => {
  if (!selectedChannel.value || !newMessage.value.trim()) return

  try {
    await selectedChannel.value.sendMessage({
      text: newMessage.value,
    })
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  }
}
function formatTimestamp(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Listen for new messages
const handleNewMessage = (event: any) => {
  if (selectedChannel.value?.cid === event.channel.cid) {
    messages.value = [...messages.value, event.message]
  }
}

onMounted(async () => {
  // Initialize the component
  await loadChannels()
  // Subscribe to new messages
  props.client.on('message.new', handleNewMessage)
})

onUnmounted(() => {
  // Cleanup event listeners
  props.client.off('message.new', handleNewMessage)
})
</script>

<template>
  <div class="grid grid-cols-4 gap-3 mx-auto">
    <!-- Channels List -->
    <div class="rounded-xl shadow-2xl border border-gray-300 p-4 h-full overflow-y-auto bg-white">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Chats</h2>
      <div v-if="loadingChannels" class="text-center text-gray-500 py-4">Loading channels...</div>
      <div v-else-if="channels.length === 0" class="text-center text-gray-500 py-4">
        No Chat found
      </div>
      <div
        v-else
        v-for="channel in channels"
        :key="channel.cid"
        @click="selectChannel(channel)"
        class="p-3 hover:bg-gray-200 cursor-pointer rounded mb-2 transition-colors"
        :class="{ 'bg-gray-200': selectedChannel?.cid === channel.cid }"
      >
        <div class="font-medium text-gray-800">
          {{ channel.data?.name || 'Unnamed Channel' }}
        </div>
        <div class="text-sm text-gray-500">{{ channel.data?.member_count || 0 }} members</div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="rounded-xl shadow-2xl border border-gray-300 p-4 max-h-full bg-white col-span-2">
      <!-- Channel Header -->
      <div v-if="selectedChannel" class="p-4 border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ selectedChannel.data?.name || 'Unnamed Channel' }}
        </h3>
      </div>

      <!-- Messages Area -->
      <div class="rounded-xl bg-[#F5F9FF]">
        <div class="max-h-[70%] overflow-y-auto p-4">
          <div v-if="!selectedChannel" class="text-center border-gray-200 text-gray-500 mt-10">
            Select a channel to start chatting
          </div>
          <template v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              class="mb-6 flex flex-col"
              :class="message.user.id === userId ? ' items-end' : 'items-start'"
            >
              <!-- Message timestamp -->
              <div class="text-xs text-gray-400 mb-1 select-none">
                {{ formatTimestamp(message.created_at) }}
              </div>

              <div
                class="flex items-start gap-3 max-w-[70%]"
                :class="message.user.id === userId ? 'flex-row-reverse' : 'flex-row'"
              >
                <!-- Avatar -->
                <div
                  class="flex-shrink-0 rounded-full overflow-hidden h-10 w-10 bg-gray-300 flex items-center justify-center"
                >
                  <img
                    v-if="message.user.image"
                    :src="message.user.image"
                    alt="avatar"
                    class="object-cover h-10 w-10"
                  />
                  <span v-else class="text-gray-600 font-semibold">
                    {{ message.user.name[0].toUpperCase() }}
                  </span>
                </div>

                <!-- Message bubble -->
                <div
                  class="p-3 text-sm max-w-full break-words"
                  :class="
                    message.user.id === userId
                      ? 'bg-gray-900 text-white rounded-full rounded-tr-none  '
                      : 'bg-white text-gray-900 rounded-full rounded-tl-none   shadow'
                  "
                >
                  {{ message.text }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-if="selectedChannel" class="p-4">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type your message..."
              class="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              :disabled="!newMessage.trim()"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <!-- Message Input -->
    </div>
    <div class="rounded-xl shadow-2xl border border-gray-300 p-4 h-full overflow-y-auto bg-white">
      files
    </div>
  </div>
</template>
