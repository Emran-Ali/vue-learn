<template>
  <div v-if="channel" class="border-t border-gray-200 p-4 bg-white">
    <!-- File upload preview -->
    <div
      v-if="isFileSelected"
      class="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between border"
    >
      <div class="flex items-center min-w-0 flex-1">
        <div class="flex-shrink-0 mr-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="getFileTypeStyles(selectedFile?.type).bg"
          >
            <span class="text-lg">{{ getFileTypeStyles(selectedFile?.type).icon }}</span>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 truncate">{{ selectedFile?.name }}</p>
          <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile?.size || 0) }}</p>
        </div>
      </div>
      <button
        @click="removeSelectedFile"
        class="flex-shrink-0 ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Remove file"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- File error message -->
    <div v-if="fileError" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-sm text-red-700">{{ fileError }}</span>
      </div>
    </div>

    <!-- Message input form -->
    <form @submit.prevent="handleSubmit" class="flex items-end gap-3">
      <!-- Input container -->
      <div class="flex-1 relative">
        <div
          class="flex items-end bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-colors"
        >
          <!-- Text input -->
          <textarea
            ref="textInput"
            v-model="newMessage"
            :placeholder="placeholder"
            :disabled="isUploading"
            @keydown="handleKeyDown"
            @input="handleInput"
            @paste="handlePaste"
            rows="1"
            class="flex-1 px-4 py-3 bg-transparent border-none resize-none focus:outline-none placeholder-gray-500 max-h-32"
            :style="{ height: textareaHeight }"
          />

          <!-- File upload button -->
          <button
            type="button"
            @click="() => fileInput?.click()"
            :disabled="isUploading"
            class="flex-shrink-0 p-3 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
        </div>

        <!-- Character count (optional) -->
        <div
          v-if="showCharacterCount && newMessage.length > 0"
          class="absolute -bottom-6 right-0 text-xs text-gray-400"
        >
          {{ newMessage.length }}{{ maxCharacters ? `/${maxCharacters}` : '' }}
        </div>
      </div>

      <!-- Send button -->
      <button
        type="submit"
        :disabled="!canSendMessage"
        class="flex-shrink-0 p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        :class="
          canSendMessage
            ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        "
        title="Send message"
      >
        <svg
          v-if="!isUploading"
          class="w-5 h-5 transform rotate-45"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
          />
        </svg>
        <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </button>
    </form>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      @change="handleFileChange"
      class="hidden"
      :accept="acceptedFileTypes"
      :disabled="isUploading"
    />

    <!-- Upload progress (if needed) -->
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
      <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
        <span>Uploading...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { Channel } from 'stream-chat'

interface Props {
  channel: Channel | null
  isUploading?: boolean
  placeholder?: string
  maxCharacters?: number
  showCharacterCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUploading: false,
  placeholder: 'Type your message...',
  maxCharacters: 0,
  showCharacterCount: false,
})

const emit = defineEmits<{
  sendMessage: [payload: { text: string; file: File | null }]
  typing: []
  stopTyping: []
}>()

// Refs
const newMessage = ref('')
const selectedFile = ref<File | null>(null)
const fileError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const textInput = ref<HTMLTextAreaElement | null>(null)
const textareaHeight = ref('auto')
const uploadProgress = ref(0)

// Constants
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_FILE_TYPES = {
  'application/pdf': { type: 'document', icon: '📄', color: 'red' },
  'application/msword': { type: 'document', icon: '📄', color: 'blue' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    type: 'document',
    icon: '📄',
    color: 'blue',
  },
  'image/jpeg': { type: 'image', icon: '🖼️', color: 'green' },
  'image/png': { type: 'image', icon: '🖼️', color: 'green' },
  'image/gif': { type: 'image', icon: '🖼️', color: 'green' },
  'image/webp': { type: 'image', icon: '🖼️', color: 'green' },
  'image/svg+xml': { type: 'image', icon: '🖼️', color: 'green' },
  'video/mp4': { type: 'video', icon: '🎥', color: 'purple' },
  'video/webm': { type: 'video', icon: '🎥', color: 'purple' },
  'audio/mpeg': { type: 'audio', icon: '🎵', color: 'yellow' },
  'audio/wav': { type: 'audio', icon: '🎵', color: 'yellow' },
} as const

const acceptedFileTypes = Object.keys(ALLOWED_FILE_TYPES).join(',')

// Computed
const isFileSelected = computed(() => !!selectedFile.value)
const canSendMessage = computed(() => {
  const hasText = newMessage.value.trim().length > 0
  const hasFile = !!selectedFile.value
  const withinLimit = props.maxCharacters === 0 || newMessage.value.length <= props.maxCharacters
  return (hasText || hasFile) && !props.isUploading && withinLimit
})

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileTypeStyles = (mimeType?: string) => {
  const fileType = mimeType ? ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES] : null

  if (!fileType) {
    return { icon: '📄', bg: 'bg-gray-100' }
  }

  const colorMap = {
    red: 'bg-red-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
  }

  return {
    icon: fileType.icon,
    bg: colorMap[fileType.color] || 'bg-gray-100',
  }
}

const adjustTextareaHeight = async () => {
  await nextTick()
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    const scrollHeight = textInput.value.scrollHeight
    const maxHeight = 128 // max-h-32 = 8rem = 128px
    textInput.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

// File handling
const validateAndSetFile = (file: File): boolean => {
  // Reset previous errors
  fileError.value = ''

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    setFileError(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`)
    return false
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
    setFileError(
      'File type not supported. Please select a PDF, image, video, audio, or document file.',
    )
    return false
  }

  selectedFile.value = file
  return true
}

const setFileError = (error: string) => {
  fileError.value = error
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const removeSelectedFile = () => {
  selectedFile.value = null
  fileError.value = ''
  uploadProgress.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) {
    removeSelectedFile()
    return
  }

  const file = input.files[0]
  validateAndSetFile(file)
}

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file && validateAndSetFile(file)) {
        break
      }
    }
  }
}

// Message handling
const handleSubmit = async () => {
  if (!canSendMessage.value) return

  const messageText = newMessage.value.trim()
  const messageFile = selectedFile.value

  // Emit the message
  emit('sendMessage', {
    text: messageText,
    file: messageFile,
  })

  // Clear inputs
  newMessage.value = ''
  removeSelectedFile()
  emit('stopTyping')

  // Reset textarea height
  await nextTick()
  if (textInput.value) {
    textInput.value.style.height = 'auto'
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Send message on Enter (but not Shift+Enter)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
    return
  }

  // Emit typing event
  emit('typing')
}

const handleInput = () => {
  adjustTextareaHeight()
  emit('typing')
}

// Watchers
watch(newMessage, () => {
  adjustTextareaHeight()
})

// Focus management
const focusInput = () => {
  nextTick(() => {
    textInput.value?.focus()
  })
}

// Expose methods for parent component
defineExpose({
  focusInput,
  clearInputs: () => {
    newMessage.value = ''
    removeSelectedFile()
  },
})
</script>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Button animations */
button:active {
  transform: scale(0.98);
}

/* File preview animations */
.file-preview-enter-active,
.file-preview-leave-active {
  transition: all 0.3s ease;
}

.file-preview-enter-from,
.file-preview-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
