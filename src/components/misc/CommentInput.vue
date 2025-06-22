<template>
  <div class="comment-bar">
    <input
      v-model="newComment"
      type="text"
      :placeholder="replyTo ? `Replying to @${replyTo}...` : 'Write a comment...'"
      @keyup.enter="sendComment"
      class="comment-input"
      :class="$q.dark.isActive ? 'text-white' : 'text-dark'"
    />

    <q-btn
      :loading="loading"
      :disable="loading || !newComment"
      flat
      dense
      class="send-btn"
      :disabled="!newComment.trim()"
      @click="sendComment"
      ><i :style="loading || !newComment ? 'color: #ddd' : ''" class="material-icons"
        >send</i
      ></q-btn
    >
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { EventBus } from 'boot/event-bus'

const emit = defineEmits(['commentSent', 'replyTerminated'])
const props = defineProps({
  post: Object,
  replyId: {
    type: Number,
    default: null,
  },
  replyTo: {
    type: String,
    default: null,
  },
})

const $q = useQuasar()
const newComment = ref('')
const parent_id = ref(null)
const loading = ref(false)
const postId = props.post.id

// Watch for changes in replyId from the parent
watch(
  () => props.replyId,
  (newId) => {
    parent_id.value = newId
    if (newId !== null) {
      newComment.value = '@' + props.replyTo + ' '
    } else {
      // If replyId becomes null (reply terminated from parent), clear the comment input
      newComment.value = ''
    }
  },
)

// Watch newComment to determine if reply mode should be terminated by user action
watch(newComment, (newVal) => {
  // If we are in reply mode (parent_id is set) and the input is completely empty,
  // then the user likely wants to cancel the reply and write a main comment.
  if (parent_id.value !== null && newVal.trim() === '') {
    emit('replyTerminated')
  }
  // Also, consider if the user explicitly removes the @username prefix.
  // This is an optional enhancement depending on desired UX.
  // For now, the above condition should be sufficient.
})

async function sendComment() {
  if (!newComment.value.trim()) return
  if (newComment.value.length > 280) {
    $q.notify({
      color: 'orange',
      message: 'Too long comment, You should only type 280 characters or less',
    })
    return
  }
  loading.value = true
  try {
    await api.post(`/api/put/post/${postId}/comment`, {
      q: newComment.value.trim(),
      parent_id: parent_id.value,
    })
    emit('commentSent')
    EventBus.emit('addedComment', postId)
    // After sending, reset the internal parent_id for the next input,
    // and also signal the parent to reset its replyId/replyTo.
    parent_id.value = null
    emit('replyTerminated') // This will also cause the parent to reset its replyId
  } catch (err) {
    console.error(err)
    return
  } finally {
    loading.value = false
  }
  newComment.value = ''
}
</script>

<style scoped lang="scss">
.comment-bar {
  display: flex;
  align-items: center;
  padding: 8px 0;
  z-index: 9999;
  border-top: 1px solid #ddd;
  opacity: 1;
}
.actions {
  display: flex;
  gap: 8px;
  margin-right: 8px;
}
.icon-btn {
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.comment-input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 6px 12px;
  background: transparent;
  margin-right: 8px;
  &:focus {
    outline: none;
  }
}
.send-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  i {
    color: green;
    font-size: 30px;
    &:active {
      transform: scale(0.91);
    }
  }
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
