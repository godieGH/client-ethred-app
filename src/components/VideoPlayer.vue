<template>
  <div
    ref="wrapper"
    class="video-wrapper"
    @click="onTap"
    @dblclick.prevent="toggleMute"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @contextmenu.prevent
  >
    <!-- Skeleton placeholder until video is ready to play -->
    <q-skeleton
      v-if="initialLoading"
      type="rect"
      :aspect-ratio="16 / 9"
      width="100%"
      class="skeleton-overlay"
    />
    <video
      v-show="!initialLoading"
      ref="video"
      :src="src"
      preload="metadata"
      :muted="mute"
      @waiting="onBuffering"
      @playing="onPlaying"
      @pause="onPaused"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @canplay="onCanPlay"
      playsinline
      webkit-playsinline
    ></video>

    <!-- Loading spinner during buffering -->
    <q-spinner
      v-if="loading"
      class="overlay text-white"
      size="64px"
      track-color="white"
      :thickness="4"
    />

    <!-- Play/Pause button -->
    <q-icon
      v-if="showPlayButton && !initialLoading"
      :name="isPlaying ? 'pause_circle_filled' : 'play_circle_filled'"
      size="64px"
      class="overlay play-btn text-white"
    />

    <!-- Seek timestamp overlay -->
    <div v-if="seeking" class="overlay seek-timestamp">
      {{ formatTime(currentTime) }}
    </div>

    <!-- Mute icon -->
    <q-icon
      v-if="mute && !initialLoading"
      name="volume_off"
      size="32px"
      class="overlay mute-icon text-white"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { EventBus } from 'boot/event-bus'
import { QSpinner, QIcon, QSkeleton } from 'quasar'
import { useSettingsStore } from 'stores/SettingsStore'

// Only extract src prop
const { src } = defineProps({ src: { type: String, required: true } })
const settingsStore = useSettingsStore()

const video = ref(null)
const wrapper = ref(null)
const isPlaying = ref(false)
const loading = ref(false)
const showPlayButton = ref(true)
const seeking = ref(false)
const currentTime = ref(0)
const initialLoading = ref(true)

//What user settings say
const autoplay = computed(() => settingsStore.autoplay)
const mute = computed({
  get: () => settingsStore.mute,
  set: (val) => {
    settingsStore.mute = val
  },
})

const emit = defineEmits(['ready'])

let touchStartX = 0
let touchStartY = 0
let touchAccum = 0

function broadcastPauseOthers() {
  EventBus.emit('pause-all')
}

function onTap() {
  if (initialLoading.value) return
  if (Math.abs(touchAccum) > 10) {
    touchAccum = 0
    return
  }
  isPlaying.value ? video.value.pause() : (broadcastPauseOthers(), video.value.play())
}

function toggleMute() {
  if (initialLoading.value) return
  mute.value = !mute.value
  broadcastMuteChange(mute.value)
}

function onBuffering() {
  loading.value = true
}

function onPlaying() {
  loading.value = false
  isPlaying.value = true
  showPlayButton.value = false
}

function onPaused() {
  isPlaying.value = false
  showPlayButton.value = true
}

function onEnded() {
  isPlaying.value = false
  showPlayButton.value = true
}

function onTimeUpdate() {
  if(video.value) {
     currentTime.value = video.value.currentTime
   }
}

function onCanPlay() {
  if (video.value) {
    video.value.muted = mute.value
    initialLoading.value = false
    emit('ready')
  } else {
    // Optional: Log a warning if this happens, for debugging purposes
    //console.warn("video.value was null in onCanPlay. Race condition?");
  }
}

function onTouchStart(e) {
  if (initialLoading.value) return
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  seeking.value = true
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - touchStartX
  const dy = e.touches[0].clientY - touchStartY
  if (Math.abs(dy) > Math.abs(dx)) return
  touchAccum = dx
  const seekSeconds = dx / 400
  const newTime = Math.max(0, Math.min(video.value.duration, video.value.currentTime + seekSeconds))
  video.value.currentTime = newTime
  currentTime.value = newTime
}

function onTouchEnd() {
  seeking.value = false
  touchAccum = 0
}

function onPauseAll() {
  if (video.value && isPlaying.value) video.value.pause()
}

let observer
onMounted(() => {
  EventBus.on('pause-all', onPauseAll)
  EventBus.on('mute-change', onGlobalMuteChange)
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (autoplay.value) {
          broadcastPauseOthers()
          video.value.play()
        }
      } else {
        video.value.pause()
      }
    },
    { threshold: 0.5 },
  )
  wrapper.value && observer.observe(wrapper.value)

  if (video.value) video.value.muted = mute.value
})

function onGlobalMuteChange(newMute) {
  mute.value = newMute
  if (video.value) video.value.muted = newMute
}

onBeforeUnmount(() => {
  EventBus.off('pause-all', onPauseAll)
  EventBus.off('mute-change', onGlobalMuteChange)
  wrapper.value && observer.unobserve(wrapper.value)
})

function broadcastMuteChange(newMuteState) {
  EventBus.emit('mute-change', newMuteState)
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(Math.floor(sec % 60)).padStart(2, '0')
  return `${m}:${s}`
}
</script>
<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  touch-action: pan-y;
}

video {
  width: 100%;
  border-radius: 8px;
  display: block;
}

.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.skeleton-overlay {
  position: absolute;
  width: 100%;
  padding-top: 56.25%; /* maintain 16:9 ratio */
  background: #eee;
  border-radius: 8px;
}

.play-btn {
  cursor: pointer;
}
.seek-timestamp {
  background: rgba(0, 0, 0, 0.6);
  padding: 0.5em 1em;
  border-radius: 4px;
  font-size: 1.2em;
  color: white;
}

.mute-icon {
  bottom: 10%;
  right: 10%;
  top: auto;
  left: auto;
  transform: none;
}
</style>