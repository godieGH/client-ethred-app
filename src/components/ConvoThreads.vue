<template>
  <div :style="$q.screen.lt.md?'height: calc(100dvh - 60px);':''" id="chatBubbleScrollArea" ref="chatContainer" class="q-pa-sm chat-container">
    <q-virtual-scroll
      ref="virtualScroll"
      scroll-target="#chatBubbleScrollArea"
      :items="groupedMessages"
      v-slot="{ item: message }"
      virtual-scroll-item-size="35"
    >
      <div :key="message._id">
        <div
          v-if="message.sender_type === 'system'"
          class="message-system text-center text-caption text-grey-6"
        >
          {{ message.content.text }}
        </div>

        <div
          v-else
          :class="message.isMine ? 'message-mine-wrapper' : 'message-other-wrapper'"
          class="row items-start no-wrap"
        >
          <q-avatar v-if="!message.isMine && message.showAvatar && !message.is_deleted" size="md">
            <img :src="message.sender.avatar || 'default.png'" />
          </q-avatar>
          <div
            v-else-if="!message.isMine && !message.showAvatar"
            :style="!message.is_deleted ? 'width: 35px;' : ''"
          ></div>

          <div
            :class="message.isMine ? 'message-bubble message-mine' : 'message-bubble message-other'"
            class="q-pa-sm q-ma-xs"
          >
            <div v-if="message.reply_to_message" class="reply-bubble">
              <div class="text-caption text-blue-8 text-bold">
                Replying to
                {{
                  message.isMine
                    ? message.reply_to_message.isMine
                      ? 'Yourself'
                      : message.reply_to_message.sender_name
                    : message.reply_to_message.isMine
                      ? message.reply_to_message.sender_name
                      : 'Yourself'
                }}
              </div>
              <div class="text-caption text-grey-7 ellipsis">
                {{
                  message.reply_to_message.content_text ||
                  (message.reply_to_message.content_attachment_type
                    ? `[${message.reply_to_message.content_attachment_type}]`
                    : '') ||
                  (message.reply_to_message.content_voice_note ? '[Voice Note]' : '')
                }}
              </div>
            </div>

            <div v-if="message.content.text" :class="{ 'text-grey': message.is_deleted }">
              <span v-if="message.is_deleted && !message.isMine">
                <span class="material-icons">do_not_disturb</span> This message was deleted.
              </span>
              <span v-else>
                {{ message.content.text }}
              </span>
            </div>
            <div v-if="message.content.attachment_type === 'image'">
              <q-img :src="message.content.attachment" class="message-image" />
            </div>
            <div v-if="message.content.attachment_type === 'video'">
              <CustomVideoPlayer :src="message.content.attachment" />
            </div>
            <div v-if="message.content.voice_note">
              <div class="voice-note-player row items-center no-wrap q-gutter-xs">
                <q-btn
                  :icon="
                    currentPlayingVoiceNoteId === message._id && isPlaying ? 'pause' : 'play_arrow'
                  "
                  flat
                  dense
                  round
                  @click="toggleVoiceNotePlay(message._id, message.content.voice_note)"
                />
                <div
                  class="voice-note-waveform"
                  :style="{
                    width: '100px',
                    height: '30px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '5px',
                  }"
                  @click="seekVoiceNote($event, message._id)"
                >
                  <div
                    v-if="currentPlayingVoiceNoteId === message._id"
                    class="waveform-progress"
                    :style="{ width: voiceNoteProgress + '%' }"
                  ></div>
                  <div v-else class="waveform-static"></div>
                </div>
                <div style="font-size: 10px" class="voice-note-time text-caption text-grey-6">
                  {{
                    currentPlayingVoiceNoteId === message._id
                      ? formatDuration(voiceNoteCurrentTime)
                      : formatDuration(voiceNoteDurations[message._id] || 0)
                  }}
                  | {{ formatDuration(voiceNoteDurations[message._id] || 0) }}
                </div>
              </div>
            </div>
            <div
              v-if="!message.is_deleted"
              :class="message.isMine ? 'text-right' : 'text-left'"
              style="font-size: 10px"
              class="text-caption text-grey-5"
            >
              <span
                v-if="message.isMine && message.queued"
                class="q-pr-xs material-icons"
                style="font-size: 14px"
                >schedule</span
              >
              <span
                v-if="
                  message.isMine && !message.queued && message.read_by && message.read_by.length > 0
                "
                class="text-blue q-pr-xs material-icons"
                style="font-size: 14px"
                >done_all</span
              >
              <span
                v-else-if="message.isMine && !message.queued"
                class="q-pr-xs material-icons"
                style="font-size: 14px"
                >done</span
              >
              {{ formatTime(message.sent_at) }}
            </div>
          </div>
        </div>
      </div>
    </q-virtual-scroll>
  </div>
</template>

<script setup>
import CustomVideoPlayer from 'components/VideoPlayer.vue'
import { ref, computed, onUnmounted, watch, onMounted, nextTick } from 'vue' // Import watch and onMounted
import { date } from 'quasar'

const props = defineProps({
  currentConversation: Object,
})

watch(
  () => props.currentConversation,
  (a) => {
    //console.log(a)
    void a
  },
)

const messages = ref([
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 21,
    sender: { id: 21, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there!',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707000,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: true,
    read_by: [{ id: 21 }],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there!',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there!',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: true,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: true,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: true,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: true,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: true,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 22,
    sender: { id: 22, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: true,
    is_edited: false,
    reply_to_message: null,
    isMine: false,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 21,
    sender: { id: 21, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: true,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 21,
    sender: { id: 21, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: true,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 21,
    sender: { id: 21, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: true,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 21,
    sender: { id: 21, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: true,
    read_by: [],
  },
  {
    _id: 1,
    conversation_id: 30,
    sender_id: 21,
    sender: { id: 21, name: 'Alice', avatar: '/uploads/avatar-2-1750627228592.jpg' },
    sender_type: 'user',
    content: {
      text: 'Hello there! sjsjissjebe ehej',
      attachment: null,
      attachment_type: null,
      voice_note: null,
    },
    sent_at: 1751334707070,
    is_deleted: false,
    is_edited: false,
    reply_to_message: null,
    isMine: true,
    read_by: [],
    queued: true,
  },
])

const virtualScroll = ref(null)
const chatContainer = ref(null)

const currentAudio = ref(null)
const currentPlayingVoiceNoteId = ref(null)
const isPlaying = ref(false)
const voiceNoteCurrentTime = ref(0)
const voiceNoteDurations = ref({})
const voiceNoteProgress = ref(0)

const formatTime = (timestamp) => {
  return date.formatDate(timestamp, 'HH:mm')
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const toggleVoiceNotePlay = async (messageId, url) => {
  if (currentAudio.value && currentPlayingVoiceNoteId.value === messageId) {
    // If clicking the same voice note, toggle play/pause
    if (isPlaying.value) {
      currentAudio.value.pause()
    } else {
      await currentAudio.value.play().catch((e) => console.error('Error playing voice note:', e))
    }
    isPlaying.value = !isPlaying.value
  } else {
    // If clicking a different voice note or no voice note is playing, stop current and play new
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
    }

    currentAudio.value = new Audio(url)
    currentPlayingVoiceNoteId.value = messageId
    isPlaying.value = true
    voiceNoteCurrentTime.value = 0
    voiceNoteProgress.value = 0

    currentAudio.value.addEventListener('timeupdate', () => {
      voiceNoteCurrentTime.value = currentAudio.value.currentTime
      if (voiceNoteDurations.value[messageId]) {
        voiceNoteProgress.value =
          (currentAudio.value.currentTime / voiceNoteDurations.value[messageId]) * 100
      }
    })

    currentAudio.value.addEventListener('ended', () => {
      isPlaying.value = false
      currentPlayingVoiceNoteId.value = null
      voiceNoteCurrentTime.value = 0
      voiceNoteProgress.value = 0
    })

    currentAudio.value.addEventListener('loadedmetadata', () => {
      voiceNoteDurations.value = {
        ...voiceNoteDurations.value,
        [messageId]: currentAudio.value.duration,
      }
    })

    await currentAudio.value.play().catch((e) => console.error('Error playing voice note:', e))
  }
}

const seekVoiceNote = (event, messageId) => {
  if (!voiceNoteDurations.value[messageId]) {
    // Cannot seek if duration is not known yet
    return
  }

  const waveformElement = event.currentTarget
  const clickX = event.offsetX // X-coordinate of the click relative to the element
  const totalWidth = waveformElement.offsetWidth // Total width of the waveform element

  const seekPercentage = clickX / totalWidth
  const seekTime = voiceNoteDurations.value[messageId] * seekPercentage

  if (currentAudio.value && currentPlayingVoiceNoteId.value === messageId) {
    currentAudio.value.currentTime = seekTime
  } else {
    // If not currently playing, start playing from the seeked position
    const message = messages.value.find((msg) => msg._id === messageId)
    if (message && message.content.voice_note) {
      toggleVoiceNotePlay(messageId, message.content.voice_note).then(() => {
        if (currentAudio.value) {
          currentAudio.value.currentTime = seekTime
        }
      })
    }
  }
}

onUnmounted(() => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value = null
  }
})

const groupedMessages = computed(() => {
  if (!messages.value || messages.value.length === 0) {
    return []
  }

  const processedMessages = []
  for (let i = 0; i < messages.value.length; i++) {
    const currentMessage = { ...messages.value[i] } // Create a copy to avoid direct mutation
    let showAvatar = false

    // Determine if avatar should be shown
    if (currentMessage.sender_type === 'system') {
      showAvatar = false // System messages don't have avatars
    } else if (i === 0) {
      showAvatar = true // Always show avatar for the first message
    } else {
      const previousMessage = messages.value[i - 1]
      // Show avatar if sender changes or if previous message was a system message
      if (
        currentMessage.sender_id !== previousMessage.sender_id ||
        previousMessage.sender_type === 'system' ||
        previousMessage.is_deleted
      ) {
        showAvatar = true
      }
    }
    currentMessage.showAvatar = showAvatar
    processedMessages.push(currentMessage)
  }
  return processedMessages
})

const scrollToBottom = () => {
  if (virtualScroll.value && groupedMessages.value.length > 0) {
    virtualScroll.value.scrollTo(groupedMessages.value.length - 1, 0)
  }
}

watch(
  groupedMessages,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true },
)

onMounted(() => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>

<style scoped>
.chat-container {
  overflow-y: scroll;
  height: calc(100dvh - 130px);
  padding-bottom: 70px;
}

/* Base bubble styles */
.message-bubble {
  max-width: 70%; /* Adjust as needed */
  border-radius: 10px; /* Rounded corners */
  word-wrap: break-word; /* Ensure long words break */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  flex-shrink: 1; /* Allow bubble to shrink */
}

/* My Messages */
.message-mine-wrapper {
  justify-content: flex-end; /* Align to the right */
}

.message-mine {
  background-color: #e0f2f7; /* Light blue for my messages */
  color: #333;
  border-bottom-right-radius: 1px;
}

/* Other User Messages */
.message-other-wrapper {
  justify-content: flex-start; /* Align to the left */
}

.message-other {
  background-color: #ffffff; /* White for other user messages */
  color: #333;
}

/* System Messages */
.message-system {
  font-style: italic;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 5px 0;
}

/* Message attachments (images) */
.message-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 5px;
}

.message-video {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 5px;
}

/* Reply Bubble Styles */
.reply-bubble {
  background-color: rgba(0, 0, 0, 0.05); /* Slightly darker background for the reply block */
  border-left: 4px solid #1976d2; /* Blue border on the left */
  border-radius: 4px;
  padding: 5px 8px;
  margin-bottom: 5px;
  font-size: 0.85em;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis; /* For long text replies */
  white-space: nowrap; /* Keep the content on a single line */
}

.reply-bubble .text-bold {
  font-weight: 600;
}

/* Voice Note Player Styles */
.voice-note-player {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px; /* Adjust as needed */
}

.voice-note-waveform {
  position: relative;
  flex-grow: 1;
  background-color: #e0e0e0; /* Static background for the waveform area */
  border-radius: 5px;
  overflow: hidden; /* Ensure progress bar stays within bounds */
  cursor: pointer; /* Indicate it's clickable */
}

.waveform-progress {
  height: 100%;
  background-color: #1976d2; /* Blue for progress */
  border-radius: 5px;
  transition: width 0.1s linear; /* Smooth progress animation */
}

.waveform-static {
  /* This would be for a static waveform representation when not playing */
  height: 100%;
  background-image:
    linear-gradient(to right, #bdbdbd 1px, transparent 1px),
    linear-gradient(to right, #bdbdbd 1px, transparent 1px);
  background-size:
    5px 100%,
    5px 100%;
  background-repeat: repeat-x;
  background-position: center;
  opacity: 0.7;
}

.voice-note-time {
  white-space: nowrap;
}
</style>
