<template>
  <div class="profile-page">
    <div class="profile-wrapper" style="padding-top: 30px">
      <!-- HEADER: Skeleton when loading, real content otherwise -->
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

      <!-- COUNTS ROW -->
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

      <!-- TAB PANEL -->
      <div v-if="!loading" class="tabs-container q-pa-sm q-mt-lg">
        <q-tabs
          v-model="tab"
          class="text-primary"
          active-color="primary"
          indicator-color="primary"
          dense
        >
          <q-tab name="posts" label="Posts" class="tab-label" />
          <q-tab name="media" label="Media" class="tab-label" />
          <q-tab name="contact" label="Contact" class="tab-label" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="posts">
            <div v-if="!user.posts || user.posts.length === 0" class="text-grey">No posts yet.</div>
            <div v-else>
              <q-card v-for="post in user.posts" :key="post.id" class="q-mb-md" flat bordered>
                <!-- Header: Avatar and Username (adjust as needed) -->
                <q-card-section class="row items-center">
                  <div class="q-ml-sm">
                    <div class="text-caption text-grey">
                      {{ formatDate(post.createdAt) }}
                    </div>
                  </div>
                </q-card-section>

                <!-- Content based on type -->
                <q-card-section>
                  <!-- Text Post -->
                  <div v-if="post.type === 'text'" class="text-body1">
                    {{ post.body }}
                  </div>

                  <!-- Image Post -->
                  <div v-else-if="post.type === 'image'">
                    <q-img
                      src="/uploads/avatar-4-1748267859037.jpg"
                      ratio="16/9"
                      class="rounded-borders"
                    />
                    <div v-if="post.body" class="q-mt-sm text-caption">
                      {{ post.body }}
                    </div>
                  </div>

                  <!-- Video Post -->
                  <div v-else-if="post.type === 'video'">
                    <video
                      controls
                      :src="post.mediaUrl"
                      class="q-mb-sm"
                      style="width: 100%; max-height: 400px"
                    ></video>
                    <div v-if="post.body" class="text-caption">
                      {{ post.body }}
                    </div>
                  </div>

                  <!-- Link Post -->
                  <div v-else-if="post.type === 'link'">
                    <div>
                      <a :href="post.linkUrl" target="_blank" class="text-primary">
                        {{ post.linkUrl }}
                      </a>
                    </div>
                    <div v-if="post.body" class="q-mt-sm text-caption">
                      {{ post.body }}
                    </div>
                  </div>

                  <!-- Fallback -->
                  <div v-else>
                    <div class="text-body1">
                      {{ post.body || 'Unsupported post type' }}
                    </div>
                  </div>
                </q-card-section>

                <!-- Action Buttons -->
                <q-card-actions align="between">
                  <q-btn flat round icon="far fa-comment" />
                  <q-btn flat round icon="send" />
                  <q-btn flat round icon="favorite_border" />
                </q-card-actions>
              </q-card>
            </div>
          </q-tab-panel>

          <q-tab-panel name="media">
            <div v-if="!user.media || user.media.length === 0" class="text-grey">
              No media uploaded.
            </div>
            <div v-else class="row wrap media-grid">
              <q-img
                v-for="item in user.media"
                :key="item.id"
                :src="mediaUrl(item.file)"
                class="q-mr-sm q-mb-sm media-thumb"
              />
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { QAvatar, QBtn, QImg, QTabs, QTab, QTabPanels, QTabPanel, QSkeleton } from 'quasar'
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
  posts: [],
  media: [],
  bio: '',
})
const tab = ref('posts')
const showFullBio = ref(false)

const avatarUrl = computed(() =>
  user.value.avatar ? `/uploads/${user.value.avatar}` : '/default.png',
)
const mediaUrl = (file) => `/uploads/${file}`
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
    }
    loading.value = false
  } catch (err) {
    console.error(err.message)
  }

  /*try {
    const { data } = await api.get('/posts/')
    user.value.posts = data

    console.log(user.value.posts)
  } catch (err) {
    console.error(err.message)
  }*/
})

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

function formatDate(iso) {
  const now = new Date()
  const d = new Date(iso)
  const diff = now - d // ms
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  const wk = Math.floor(day / 7)
  const mo = Math.floor(day / 30)
  const yr = Math.floor(day / 365)

  if (sec < 60) return `${sec}s ago`
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  if (day < 7) return `${day}d ago`
  if (wk < 8) return `${wk}w ago` // covers up to ~55 days
  if (mo < 2) return `${wk}w ago` // 4–8 weeks
  // beyond ~60 days
  const optsSameYear = { day: 'numeric', month: 'short' }
  const optsDiffYear = { day: 'numeric', month: 'short', year: '2-digit' }
  if (yr >= 1) return `${yr}y ago` // only once you hit ≥365 days
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('en-US', optsSameYear)
  }
  return d.toLocaleDateString('en-US', optsDiffYear)
}
</script>
<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  width: 100%; /* ← add this */
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

/* Media grid thumbnails */
.media-thumb {
  width: 100px;
  height: 100px;
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
  white-space: pre-line; /* or “pre-wrap” if you also want to preserve extra spaces */
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
}

.rounded-borders {
  border-radius: 8px;
}
</style>
