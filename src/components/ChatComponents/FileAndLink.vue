<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import type { StreamChat, Channel, Event, MessageResponse } from 'stream-chat'
import SearchUser from '@/components/ChatComponents/SearchUser.vue'
import MessageInput from '@/components/ChatComponents/MessageInput.vue'
import ChatMessage from '@/components/ChatComponents/ChatMessage.vue'

const props = defineProps<{ channel: StreamChat }>()

// Get user details from localStorage
const userId = localStorage.getItem('user') ?? ''

// URL regex pattern
const URL_PATTERN =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi

const typingText = computed(() => {
  const userIds = Object.keys(typingUsers.value).filter((id) => id !== userId)

  if (userIds.length === 0) return ''
  if (userIds.length === 1) return `${typingUsers.value[userIds[0]]} is typing...`
  if (userIds.length === 2)
    return `${typingUsers.value[userIds[0]]} and ${typingUsers.value[userIds[1]]} are typing...`

  return 'Several people are typing...'
})

// Extract all links from messages for the Files & Media section
const extractedLinks = computed(() => {
  if (!messages.value.length) return []

  const links: { url: string; message: any }[] = []

  messages.value.forEach((message) => {
    if (!message.text) return

    const matches = message.text.match(URL_PATTERN)
    if (matches) {
      matches.forEach((url) => {
        links.push({
          url,
          message,
        })
      })
    }
  })

  return links
})

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
    // Clear typing users when changing channels
    typingUsers.value = {}

    selectedChannel.value = channel
    await channel.watch()

    // Extract links from messages and load previews
    extractedLinks.value.forEach((link) => {
      fetchLinkPreview(link.url)
    })
  } catch (error) {
    console.error('Error selecting channel:', error)
  }
}

// Fetch link preview data
const fetchLinkPreview = async (url: string) => {
  if (urlPreviews.value[url]) return

  try {
    isLoadingUrlPreview.value = true

    if (selectedChannel.value) {
      const response = await selectedChannel.value.sendMessage({
        text: url,
      })

      if (response.message.attachments?.[0]?.og_scrape_url) {
        urlPreviews.value[url] = response.message.attachments[0]
      }
    }
  } catch (error) {
    console.error('Error fetching link preview:', error)
  } finally {
    isLoadingUrlPreview.value = false
  }
}

function hasAttachment(message: any) {
  return message.attachments && message.attachments.length > 0
}

// Helper function to format file size
function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

// Handle typing indicators
function handleKeyDown() {
  if (!selectedChannel.value) return

  selectedChannel.value.keystroke()
}

function startTyping() {
  if (typingTimeout.value[userId]) {
    clearTimeout(typingTimeout.value[userId])
  }

  typingTimeout.value[userId] = setTimeout(() => {
    stopTyping()
  }, 3000) // Stop typing after 3 seconds of inactivity
}

function stopTyping() {
  if (!selectedChannel.value) return

  if (typingTimeout.value[userId]) {
    clearTimeout(typingTimeout.value[userId])
    delete typingTimeout.value[userId]
  }

  // Notify that user stopped typing
  selectedChannel.value.stopTyping()
}

// Function to handle adding a URL for preview
function addUrlPreview() {
  if (!urlInput.value || !urlInput.value.match(URL_PATTERN)) return

  fetchLinkPreview(urlInput.value)
  urlInput.value = ''
}

// Handler for typing start events
const handleTypingStart = (event: Event) => {
  if (!selectedChannel.value) return
  if (event.cid !== selectedChannel.value.cid) return

  const user = event.user
  if (user.id !== userId) {
    typingUsers.value = { ...typingUsers.value, [user.id]: user.name || user.id }
  }
}

// Handler for typing stop events
const handleTypingStop = (event: Event) => {
  if (!selectedChannel.value) return
  if (event.cid !== selectedChannel.value.cid) return

  const user = event.user
  if (user.id !== userId && typingUsers.value[user.id]) {
    const newTypingUsers = { ...typingUsers.value }
    delete newTypingUsers[user.id]
    typingUsers.value = newTypingUsers
  }
}

// Listen for new messages
const handleNewMessage = (event: any) => {
  if (selectedChannel.value?.cid === event.channel.cid) {
    // Push the new message to the array and trigger reactivity
    messages.value.push(event.message)
    // Force reactivity update by creating a new array reference
    messages.value = [...messages.value]

    console.log('New message received:', event.message)

    // Check for links in the new message
    if (event.message.text) {
      const matches = event.message.text.match(URL_PATTERN)
      if (matches) {
        matches.forEach((url) => {
          fetchLinkPreview(url)
        })
      }
    }
  }
}

onMounted(async () => {
  console.log('Event listeners registered successfully')
})

onUnmounted(() => {
  // Cleanup event listeners
  props.client.off('message.new', handleNewMessage)
  props.client.off('typing.start', handleTypingStart)
  props.client.off('typing.stop', handleTypingStop)

  // Clear all typing timeouts
  Object.values(typingTimeout.value).forEach((timeout) => clearTimeout(timeout))
})
</script>

<template>
  <div class="grid grid-cols-4 gap-3 mx-auto">
    <!-- Files and links panel -->
    <div class="rounded-xl shadow-2xl border border-gray-300 p-4 h-full overflow-y-auto bg-white">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Files & Media</h2>

      <div v-if="!selectedChannel" class="text-center text-gray-500 py-4">
        Select a channel to view files and links
      </div>

      <div v-else>
        <!-- Tabs for Files and Links -->
        <div class="flex border-b mb-4">
          <button class="py-2 px-4 font-medium border-b-2 border-blue-500 text-blue-500">
            Shared Content
          </button>
        </div>

        <!-- File attachments section -->
        <div v-if="messages.some((msg) => hasAttachment(msg))" class="mb-6">
          <h3 class="text-lg font-medium mb-2">Files</h3>
          <div class="space-y-3">
            <div
              v-for="message in messages.filter(
                (msg) => hasAttachment(msg) && msg.attachments.some((att) => att.type === 'file'),
              )"
              :key="message.id"
              class="border border-gray-200 rounded-lg p-2"
            >
              <div
                v-for="(attachment, index) in message.attachments.filter(
                  (att) => att.type === 'file',
                )"
                :key="index"
              >
                <div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md">
                  <div class="text-xl">📄</div>
                  <div class="overflow-hidden">
                    <div class="text-sm font-medium truncate">
                      {{ attachment.title || 'File' }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ formatFileSize(attachment.file_size || 0) }}
                    </div>
                  </div>
                  <a
                    :href="attachment.asset_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-auto text-blue-500 hover:text-blue-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
                      />
                      <path
                        d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Image attachments section -->
        <div v-if="messages.some((msg) => hasAttachment(msg))" class="mb-6">
          <h3 class="text-lg font-medium mb-2">Images</h3>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="message in messages.filter(
                (msg) => hasAttachment(msg) && msg.attachments.some((att) => att.type === 'image'),
              )"
              :key="message.id"
            >
              <div
                v-for="(attachment, index) in message.attachments.filter(
                  (att) => att.type === 'image',
                )"
                :key="index"
              >
                <img
                  :src="attachment.thumb_url || attachment.image_url"
                  :alt="attachment.fallback || 'Image'"
                  class="w-full h-32 object-cover rounded-md cursor-pointer"
                  @click="window.open(attachment.image_url, '_blank')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Links section -->
        <div v-if="extractedLinks.length > 0" class="mb-6">
          <h3 class="text-lg font-medium mb-2">Links</h3>

          <!-- Add URL input -->
          <div class="flex gap-2 mb-4">
            <input
              v-model="urlInput"
              type="url"
              placeholder="Enter a URL to preview..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              @click="addUrlPreview"
              class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
              :disabled="!urlInput.match(URL_PATTERN)"
              :class="{ 'opacity-50 cursor-not-allowed': !urlInput.match(URL_PATTERN) }"
            >
              Add
            </button>
          </div>

          <!-- Links list -->
          <div class="space-y-3">
            <div
              v-for="(link, index) in extractedLinks"
              :key="index"
              class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <!-- If we have a preview for this link -->
              <div v-if="urlPreviews[link.url]" class="relative">
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="block">
                  <!-- Preview image if available -->
                  <img
                    v-if="urlPreviews[link.url].image_url"
                    :src="urlPreviews[link.url].image_url"
                    :alt="urlPreviews[link.url].title || 'Link preview'"
                    class="w-full h-32 object-cover"
                  />
                  <div class="p-3">
                    <div class="font-medium">{{ urlPreviews[link.url].title || link.url }}</div>
                    <div class="text-xs text-gray-500 line-clamp-2">
                      {{ urlPreviews[link.url].text || 'No description available' }}
                    </div>
                    <div class="text-xs text-blue-500 truncate mt-1">{{ link.url }}</div>
                  </div>
                </a>
              </div>

              <!-- Basic link display if no preview is available -->
              <div v-else class="p-3">
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-500 hover:underline"
                >
                  {{ link.url }}
                </a>
                <div class="text-xs text-gray-500 mt-1">
                  Shared by {{ link.message.user.name || link.message.user.id }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 py-4">
          No shared content in this channel yet
        </div>
      </div>
    </div>
  </div>
</template>
