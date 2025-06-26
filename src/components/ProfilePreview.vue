<template>
  <div class="profile-page">
    <div class="profile-wrapper" style="padding-top: 30px">
      <div v-if="loading" class="column items-center text-center q-mb-lg">
        <q-skeleton type="circle" width="120px" height="120px" />
        <q-skeleton type="text" width="40%" class="q-mt-md" />
        <q-skeleton type="text" width="30%" class="q-mt-xs" />
        <q-skeleton type="text" width="60%" class="q-mt-sm" />
        <q-skeleton type="rect" width="25%" class="q-mt-md" />
      </div>
      <div v-else class="column q-mb-lg items-center text-center">
        <q-avatar size="120px">
          <img :src="avatarUrl" :alt="user.name" />
        </q-avatar>
        <div class="text-h5 q-mt-md font-display">
          {{ user.name }}
        </div>
        <div class="text-subtitle2 text-grey q-mt-xs font-display">@{{ user.username }}</div>
        <div class="bio q-mt-sm">
          {{ displayBio }}
          <span v-if="isBioLong" @click="toggleBio" class="bio-toggle-inline">
            {{ showFullBio ? ' Less' : ' More' }}
          </span>
        </div>

        <q-btn
          class="q-mt-md follow-btn"
          :label="buttonLabel"
          :loading="followLoading"
          :disable="followLoading || user.id === userStore.user.id"
          color="primary"
          size="sm"
          @click="toggleFollow"
        />
      </div>

      <div v-if="!loading" class="row justify-around counts-row">
        <div class="column items-center">
          <div class="text-h6">
            {{ user.postsCount }}
          </div>
          <div class="text-caption q-mt-xs">Posts</div>
        </div>
        <div class="column items-center">
          <div class="text-h6">
            {{ user.followingCount }}
          </div>
          <div class="text-caption q-mt-xs">Following</div>
        </div>
        <div class="column items-center">
          <div class="text-h6">
            {{ user.followersCount }}
          </div>
          <div class="text-caption q-mt-xs">Followers</div>
        </div>
      </div>

      <div v-if="!loading" class="tabs-container">
        <q-tabs
          v-model="tab"
          class="text-primary"
          active-color="primary"
          indicator-color="primary"
          dense
        >
          <q-tab name="posts" label="Posts" class="tab-label text-grey" />
          <q-tab name="media" label="Media" class="tab-label text-grey" />
          <q-tab name="contact" label="Contact" class="tab-label text-grey" />
        </q-tabs>

        <q-tab-panels style="margin-top: 10px" v-model="tab" animated>
          <q-tab-panel style="padding: 0" name="posts">
            <div v-if="!user.postsCount" class="text-grey">No posts yet.</div>
            <div v-else>
              <postsTab :user="user" />
            </div>
          </q-tab-panel>

          <q-tab-panel style="padding: 0" name="media">
            <div v-if="!user.media || user.media.length === 0" class="text-grey">
              No media uploaded.
            </div>
            <div v-else class="media-gallery">
              <div
                v-for="(item, index) in user.media"
                :key="item.id"
                class="media-item"
                @mouseenter="handleVideoHover(index, true)"
                @mouseleave="handleVideoHover(index, false)"
              >
                <q-img
                  v-if="item.type === 'image'"
                  :src="item.mediaUrl"
                  class="media-content"
                  fit="cover"
                  clickable
                  @click="openMediaPreviewer(item.mediaUrl, 'image')"
                />
                <video
                  v-else-if="item.type === 'video'"
                  :src="item.originalMedia"
                  @click="openMediaPreviewer(item.mediaUrl, 'video', item.thumbnailUrl)"
                  muted
                  :poster="item.thumbnailUrl"
                  loop
                  playsinline
                  class="media-content video-item"
                  :ref="
                    (el) => {
                      if (el) videoRefs[index] = el
                    }
                  "
                ></video>
                <div v-if="item.type === 'video'" class="video-overlay">
                  <q-icon name="videocam" color="white" size="24px" />
                </div>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="contact">
            <div v-if="!hasContacts" class="text-grey-6 text-center q-pa-md">No contact info.</div>
            <q-list v-else bordered padding class="q-pa-sm">
              <q-item
                v-if="user.contact.phone"
                clickable
                tag="a"
                :href="`tel:${user.contact.phone}`"
              >
                <q-item-section avatar>
                  <q-icon name="phone" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Phone</q-item-label>
                  <q-item-label caption>{{ formattedPhone }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="user.contact.blog"
                clickable
                tag="a"
                :href="user.contact.blog"
                target="_blank"
                rel="noopener noreferrer"
              >
                <q-item-section avatar>
                  <q-icon name="web" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Blog</q-item-label>
                  <q-item-label caption>{{ user.contact.blog }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="user.contact.twitter"
                clickable
                tag="a"
                :href="twitterUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <q-item-section avatar>
                  <q-icon name="fab fa-twitter" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Twitter</q-item-label>
                  <q-item-label caption>{{ user.contact.twitter }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="user.email" clickable tag="a" :href="`mailto:${user.email}`">
                <q-item-section avatar>
                  <q-icon name="email" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Email</q-item-label>
                  <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>

  <q-dialog v-model="previewMedia" position="bottom" transition-show="slide-up">
    <q-card
      :style="{
        padding: '10px',
        'border-radius': '20px',
        position: 'relative',
        display: 'flex',
        'flex-direction': 'column',
        height: 'auto',
        width: '100%',
        'max-width': '600px',
      }"
    >
      <span class="handle-close" @click="closeMediaPreviewer()"></span>

      <div style="flex: 1 1 auto; overflow-y: auto; padding: 8px">
        <component :is="currentMediaPreviewer" :src="currentSrc" :poster="videoPoster" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import postsTab from 'components/misc/postsTab.vue'
import { ref, onMounted, computed, watch, shallowRef } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user'
import { useSettingsStore } from 'stores/SettingsStore'
import { EventBus } from 'boot/event-bus'

const props = defineProps({
  post: Object,
})

const settingsStore = useSettingsStore()
const userStore = useUserStore()
const $q = useQuasar()
const id = props.post.user.id

const loading = ref(true)
const followLoading = ref(false)
const user = ref({
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
  bio: '',
  media: [], // Initialize media as an empty array
})
const tab = ref('posts')
const showFullBio = ref(false)
const previewMedia = ref(false)

import PreviewImage from './misc/PreviewImage.vue'
import PreviewVideo from './VideoPlayer.vue'

const currentMediaPreviewer = shallowRef(null)
const currentSrc = ref(null)
const videoPoster = ref(null)
function openMediaPreviewer(src, type, poster = null) {
  previewMedia.value = true
  if (type === 'image') {
    currentMediaPreviewer.value = PreviewImage
    currentSrc.value = src
  }
  if (type === 'video') {
    currentMediaPreviewer.value = PreviewVideo
    currentSrc.value = src
    videoPoster.value = poster
    console.log(poster)
  }
}

function closeMediaPreviewer() {
  previewMedia.value = false
  currentSrc.value = null
}

// Ref to store video elements
const videoRefs = ref([])

const avatarUrl = computed(() =>
  user.value.avatar ? `/uploads/${user.value.avatar}` : '/default.png',
)

const buttonLabel = computed(() => (user.value.isFollowing ? 'Unfollow' : 'Follow'))

const isBioLong = computed(() => user.value.bio && user.value.bio.length > 80)
const displayBio = computed(() => {
  if (!isBioLong.value) return user.value.bio
  return showFullBio.value ? user.value.bio : user.value.bio.slice(0, 80) + '...'
})

onMounted(async () => {
  $q.dark.set(settingsStore.dark)
  try {
    const { data } = await api.get(`/users/thisuser/${id}`)
    user.value = {
      ...data,
      contact: data.contact || {},
      media: data.media || [], // Ensure media is initialized from fetched data
    }
    //console.log(user.value)
    loading.value = false
  } catch (err) {
    console.error(err.message)
  }
})

// Watch for tab changes to pause all videos when switching away from "media" tab
watch(tab, (newTab) => {
  if (newTab !== 'media') {
    videoRefs.value.forEach((video) => {
      if (video) {
        video.pause()
        video.currentTime = 0 // Rewind to start
      }
    })
  }
})

function handleVideoHover(index, isHovering) {
  const video = videoRefs.value[index]
  if (video) {
    if (isHovering) {
      video.play().catch((error) => {
        // Autoplay might be blocked by browsers, handle the error gracefully
        console.warn('Autoplay prevented:', error)
      })
    } else {
      video.pause()
      video.currentTime = 0 // Rewind to start when mouse leaves
    }
  }
}

async function toggleFollow() {
  if (followLoading.value) return
  followLoading.value = true

  const wasFollowing = user.value.isFollowing
  // optimistic UI
  user.value.isFollowing = !wasFollowing
  user.value.followersCount += wasFollowing ? -1 : 1

  try {
    if (wasFollowing) {
      await api.delete(`/users/${id}/follow`)
    } else {
      await api.post(`/users/${id}/follow`)
    }
    EventBus.emit('updateFollowBtnState', id)
    // refresh authoritative state
    const { data } = await api.get(`/users/thisuser/${id}`)
    user.value = {
      ...data,
      contact: data.contact || {},
      media: data.media || [],
    }
  } catch (err) {
    // rollback
    user.value.isFollowing = wasFollowing
    user.value.followersCount += wasFollowing ? 1 : -1
    console.error('Follow toggle failed:', err)
  } finally {
    followLoading.value = false
  }
}

function toggleBio() {
  showFullBio.value = !showFullBio.value
}

const hasContacts = computed(() => {
  const c = user.value.contact || {}
  return !!(c.phone || c.blog || c.twitter || user.value.email)
})

const formattedPhone = computed(() => user.value.contact?.phone ?? 'No phone')

const twitterUrl = computed(() => {
  const handle = user.value.contact?.twitter?.replace(/^@/, '')
  return handle ? `https://x.com/${handle}` : ''
})
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-y: scroll;
  height: 95vh;
  padding-bottom: 20px;
}

.profile-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.counts-row {
  flex-wrap: wrap;
}

.tabs-container {
  width: 100%;
}

/* New styles for the media gallery */
.media-gallery {
  display: grid;
  /* Adjust minmax(100px, 1fr) for desired minimum item size and responsiveness */
  /* This creates columns that are at least 100px wide, and as many as can fit */
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 2px; /* Small gap between items, like Instagram */
  width: 100%;
}

.media-item {
  position: relative; /* For video overlay positioning */
  width: 100%;
  padding-bottom: 100%; /* Creates a square aspect ratio container */
  overflow: hidden; /* Hide anything that goes outside the square */
}

.media-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures images/videos fill the container without distortion */
  display: block; /* Remove extra space below images/videos */
}

.video-item {
  /* No specific styles needed here unless you want to override something */
}

.video-overlay {
  position: absolute;
  top: 4px; /* Adjust as needed */
  right: 4px; /* Adjust as needed */
  background-color: rgba(0, 0, 0, 0.4); /* Semi-transparent background for visibility */
  border-radius: 4px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; /* Ensure it's above the video */
}

/* Existing styles */
.card {
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--q-shadow-2);
}

.bio {
  font-size: 0.75rem;
  color: gray;
  word-break: break-word;
}

.bio-toggle-inline {
  color: teal;
  cursor: pointer;
  font-weight: bold;
}

.bio {
  white-space: pre-line;
  font-size: 0.75rem;
  color: gray;
  word-break: break-word;
}

.text-grey-6 {
  color: #9e9e9e;
}

@media (min-width: 600px) {
  .profile-wrapper {
    padding: 0;
  }
  .media-gallery {
    /* For larger screens, maybe more columns or larger min-width */
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

.rounded-borders {
  border-radius: 8px;
}

.my-media-card {
  border-radius: 8px;
  overflow: hidden;
}

.handle-close {
  background: grey;
  padding: 3px 10px;
  width: 40px;
  position: absolute;
  top: 5px;
  right: 45%;
  border-radius: 20px;
}
</style>
