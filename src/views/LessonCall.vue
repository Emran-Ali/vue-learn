<script setup lang="ts">
import CallWraper from '@/components/callComponent/CallWraper.vue'
import JoinCall from '@/components/callComponent/JoinCall.vue'
import RingCall from '@/components/callComponent/RingCall.vue'
</script>

<template>
  <CallWraper>
    <RingCall />
    <JoinCall />
  </CallWraper>
</template>
