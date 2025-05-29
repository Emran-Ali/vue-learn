<script setup lang="ts">
import { StreamVideoClient, type User, CallingState } from '@stream-io/video-client'
import { provide } from 'vue'

const apiKey = import.meta.env.VITE_STREAM_API_KEY
const token = localStorage.getItem('streamToken') ?? undefined
const userId = localStorage.getItem('user') ?? ''
const user: User = { id: userId }

const client = new StreamVideoClient({
  apiKey,
  token,
  user,
  options: { logLevel: 'info' },
})

provide('streamClient', client)

client.state.calls$.subscribe((calls) => {
  const incomingCalls = calls.filter(
    (call) => call.isCreatedByMe === false && call.state.callingState === CallingState.RINGING,
  )
  console.log('Incoming calls', incomingCalls)
  const outgoingCalls = calls.filter(
    (call) => call.isCreatedByMe === true && call.state.callingState === CallingState.RINGING,
  )
  console.log('Outgoing calls', outgoingCalls)
})
</script>

<template></template>
