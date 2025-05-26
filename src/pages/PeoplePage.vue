<template>
  <q-page padding>
    <q-toolbar class="q-mb-md">
      <q-toolbar-title class="text-h6">Discover Creators</q-toolbar-title>
      <q-btn flat round icon="refresh" aria-label="Refresh" @click="refresh" />
    </q-toolbar>

    <!-- LOADING SKELETON IN VIRTUAL-SCROLL -->
    <q-virtual-scroll
      v-if="store.loading"
      :items="skeletonItems"
      :item-size="72"
      class="people-list"
      :virtual-scroll-target="$q.screen.gt.xs ? null : 'window'"
    >
      <template #default>
        <q-item class="q-py-sm flex items-center" style="height: 72px">
          <q-item-section avatar>
            <q-skeleton type="circle" width="40px" height="40px" />
          </q-item-section>

          <q-item-section class="q-pl-md" style="flex: 1">
            <q-skeleton type="text" width="30%" />
            <q-skeleton type="text" width="50%" class="q-mt-xs" />
          </q-item-section>

          <q-item-section side>
            <q-skeleton type="rect" width="70px" height="28px" />
          </q-item-section>
        </q-item>
      </template>
    </q-virtual-scroll>

    <!-- ERROR STATE -->
    <div v-else-if="store.error" class="text-red text-center q-my-xl">
      Failed to load users.
      <q-btn flat label="Retry" @click="refresh" />
    </div>

    <!-- REAL DATA -->
    <q-virtual-scroll
      v-else
      :items="store.people"
      :item-size="72"
      class="people-list"
      :virtual-scroll-target="$q.screen.gt.xs ? null : 'window'"
    >
      <template #default="{ item: user }">
        <q-item
          clickable
          @click="viewProfile(user.id)"
          class="q-py-sm flex items-center"
          style="height: 72px"
        >
          <!-- AVATAR SECTION -->
          <q-item-section avatar>
            <q-avatar>
              <img :src="avatarSrc(user.avatar)" alt="Avatar" />
            </q-avatar>
          </q-item-section>

          <!-- TEXT SECTION -->
          <q-item-section class="q-pl-md" style="flex: 1">
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption class="bio-text">
              {{ user.bio || defaultBio }}
            </q-item-label>
          </q-item-section>

          <!-- BUTTON SECTION -->
          <q-item-section side>
            <q-btn
              :label="user.isFollowing ? 'Unfollow' : 'Follow'"
              size="sm"
              unelevated
              color="primary"
              :disable="actionInProgress[user.id]"
              @click.stop="toggleFollow(user)"
            />
          </q-item-section>
        </q-item>
      </template>
    </q-virtual-scroll>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePeopleStore } from 'stores/peopleStore'

const store = usePeopleStore()
const router = useRouter()
const actionInProgress = reactive({})

const defaultBio = 'Hey there, I’m using Ethred…'
// array of 5 placeholders for skeleton
const skeletonItems = computed(() => Array(10).fill(null))

function refresh() {
  store.fetchAll()
}

function viewProfile(id) {
  router.push({ path: `/people/${id}` })
}

function avatarSrc(filename) {
  return filename ? `/uploads/${filename}` : `default.png`
}

async function toggleFollow(user) {
  actionInProgress[user.id] = true
  try {
    if (user.isFollowing) await store.unfollow(user.id)
    else await store.follow(user.id)
  } finally {
    actionInProgress[user.id] = false
  }
}

onMounted(() => {
  if (!store.people.length) store.fetchAll()
})
</script>

<style scoped>
.people-list {
  height: calc(100vh - 160px);
}

/* one-line bio with ellipsis */
.bio-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.people-list .q-item {
  height: 72px;
  display: flex;
  align-items: center;
}
</style>
