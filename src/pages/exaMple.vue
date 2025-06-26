<template>
  <div class="hls-player-container">
    <video
      ref="videoElement"
      controls
      playsinline
      webkit-playsinline
      class="hls-player-video"
    ></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Hls from 'hls.js'

const videoElement = ref(null)
let hls = null

const loadHlsVideo = (url) => {
  if (hls) {
    hls.destroy()
    hls = null
    console.log('HLS instance destroyed.')
  }

  if (videoElement.value && Hls.isSupported()) {
    hls = new Hls()
    hls.loadSource(url)
    hls.attachMedia(videoElement.value)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS manifest parsed, video ready.')
      // Optionally, try playing the video here
      // videoElement.value.play().catch(e => console.warn("Autoplay prevented", e));
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error:', event, data)
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('Fatal network error, trying to recover...')
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('Fatal media error, trying to recover...')
            hls.recoverMediaError()
            break
          default:
            console.error('Fatal error, destroying HLS instance.')
            hls.destroy()
            hls = null
            break
        }
      }
    })
  } else if (
    videoElement.value &&
    videoElement.value.canPlayType('application/vnd.apple.mpegurl')
  ) {
    // Native HLS support (Safari on iOS/macOS)
    videoElement.value.src = url
    // videoElement.value.play().catch(e => console.warn("Autoplay prevented (native HLS)", e));
  } else {
    console.error('HLS is not supported in this browser.')
  }
}

onMounted(() => {
  // Replace with your HLS URL for testing
  loadHlsVideo('http://localhost:3000/uploads/hls/file-6-1750793561346/master.m3u8')
})

onBeforeUnmount(() => {
  if (hls) {
    hls.destroy()
    hls = null
    console.log('HLS instance destroyed on unmount.')
  }
})
</script>

<style scoped>
.hls-player-container {
  width: 100%;
  max-width: 800px; /* Adjust as needed */
  margin: 0 auto;
  background-color: black;
  border-radius: 8px;
  overflow: hidden;
}

.hls-player-video {
  width: 100%;
  height: auto;
  display: block;
}
</style>
