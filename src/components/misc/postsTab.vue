<template>
  <div>
    <div v-if="initialLoading">
      <q-card class="q-mb-md" flat bordered v-for="n in 7" :key="n">
        <!-- Header: Avatar and Username -->
        <q-card-section class="row items-center">
          <q-skeleton type="circle" size="40px" />
          <q-skeleton type="text" width="120px" class="q-ml-sm" />
        </q-card-section>

        <!-- Image Placeholder -->
        <q-skeleton type="rect" height="300px" style="border-radius: 8px" class="q-mt-sm q-mx-md" />

        <!-- Action Buttons -->
        <div class="row items-center justify-between no-wrap q-pa-md">
          <div class="row items-center">
            <q-icon name="far fa-comment" color="grey-4" class="q-mr-sm" size="18px" />
            <q-skeleton type="text" width="30px" />
          </div>

          <div class="row items-center">
            <q-icon name="send" color="grey-4" class="q-mr-sm" size="18px" />
            <q-skeleton type="text" width="30px" />
          </div>

          <div class="row items-center">
            <q-icon name="favorite_border" color="grey-4" class="q-mr-sm" size="18px" />
            <q-skeleton type="text" width="30px" />
          </div>
        </div>

        <!-- Caption -->
        <q-card-section>
          <q-skeleton type="text" width="80%" />
          <q-skeleton type="text" width="60%" class="q-mt-xs" />
        </q-card-section>
      </q-card>
    </div>

    <div v-else>
      <q-card class="q-mb-md" flat bordered v-for="post in posts" :key="post.id">
        <!-- Header: Avatar and Username -->
        <q-card-section class="row items-center">
          <q-avatar size="40px">
            <img :src="getAvatarSrc(post.user.avatar)" />
          </q-avatar>
          <div class="q-ml-sm text-grey">
            <span>@{{ post.user.username }}</span>
            <span style="font-size: 10px">
              <span> • </span>
              <i class="material-icons">{{
                post.audience === 'public'
                  ? 'public'
                  : post.audience === 'friends'
                    ? 'people'
                    : post.audience === 'unlisted'
                      ? 'link'
                      : 'lock'
              }}</i>
            </span>

            <span style="font-size: 10px"> <span> • </span> {{ formatTime(post.createdAt) }}</span>
          </div>
        </q-card-section>
        <div
          v-if="post.type !== 'text'"
          height="300px"
          class="q-py-md"
          :class="$q.screen.width > 800 ? 'q-px-xl' : 'q-px-lg q-py-md'"
        >
          <div v-if="post.type === 'video'" class="q-video">
            <q-skeleton
              v-if="!post.videoReady"
              type="rect"
              :aspect-ratio="9 / 16"
              width="100%"
              height="400px"
              class="skeleton-overlay"
            />
            <CustomVideoPlayer
              v-show="post.videoReady"
              :poster="post.thumbnailUrl"
              :src="getPostSrc(post.mediaUrl)"
              @ready="post.videoReady = true"
            />
          </div>

          <img
            v-if="post.type === 'image'"
            loading="lazy"
            :src="getPostSrc(post.mediaUrl)"
            style="width: 100%; border-radius: 8px"
          />
        </div>

        <div>
          <PostActionCounts :post="post" />
        </div>

        <q-card-section class="q-pa-sm">
          <div
            class="post-body"
            :class="{ collapsed: !post.showMore }"
            style="
              font-size: 12px;
              margin-left: 15px;
              border-left: 2px solid grey;
              padding-left: 5px;
            "
          >
            {{ post.body }}
          </div>
          <div
            style="margin-left: 15px"
            v-if="post.body.split('\n').length > 4 || post.body.length > 200"
          >
            <button class="show-more-btn" @click="post.showMore = !post.showMore">
              {{ post.showMore ? 'less' : 'more' }}
            </button>
          </div>
          <div class="q-mt-sm">
            <div class="row" style="padding: 3px 0">
              <q-chip
                v-for="link in post.linkUrl"
                :key="link.url"
                tag="a"
                :href="link.url"
                clickable
                dense
                style="font-size: 10px; padding: 8px; margin: 0"
                outline
                class="text-green"
                icon="link"
                @click="openDrawer(post, 'links')"
              >
                {{ link.name }}
              </q-chip>
              <q-chip
                v-for="mention in post.keywords.mentions"
                :key="mention"
                clickable
                style="font-size: 10px; padding: 3px 4px; margin: 0; border: 1px solid #dddddd67"
                @click="openDrawer(post, 'mentions')"
              >
                <i class="material-icons" style="padding-right: 5px; font-size: 12px"
                  >account_circle</i
                >
                {{ mention }}
              </q-chip>
            </div>
            <span class="text-grey tags" style="font-size: 12px">
              <span v-for="tag in post.keywords.tags" :key="tag"> #{{ tag }} </span>
            </span>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="loadingMore" class="flex justify-center q-my-md">
        <q-spinner-dots size="24px" />
      </div>
    </div>

    <q-dialog v-model="showDrawer" position="bottom" transition-show="slide-up">
      <q-card
        :style="{
          paddingTop: '30px',
          'border-radius': '20px',
          position: 'relative',
          display: 'flex',
          'flex-direction': 'column',
          height: currentDrawerHeight,
          width: '100%',
          'max-width': '600px',
        }"
      >
        <span class="handle-close" @click="showDrawer = false"></span>

        <div style="flex: 1 1 auto; overflow-y: auto; padding: 8px">
          <component :is="currentPanelComponent" :post="activePost" />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import CustomVideoPlayer from 'components/VideoPlayer.vue'
import PostActionCounts from 'components/misc/othrs/PostActionCounts.vue'
import { ref, onMounted, computed, shallowRef } from 'vue'
import { getAvatarSrc, formatTime, getPostSrc } from '../../composables/formater'
import { api } from 'boot/axios'
//import { useQuasar } from 'quasar'

//const $q = useQuasar()
const initialLoading = ref(true)
const posts = ref([])
const cursor = ref(0)
const limit = ref(10)
const loadingMore = ref(false)
const hasMore = ref(true)

import MentionsPanel from 'components/MentionPanel.vue'
import LinksPanel from 'components/LinksPanel.vue'

const currentPanelComponent = shallowRef(null)
const activePost = ref(null)
const showDrawer = ref(false)
const panelTitle = ref(null)

const drawerHeightMap = {
  MentionsPanel: 'auto',
  LinksPanel: 'auto',
}

const currentDrawerHeight = computed(() => {
  if (currentPanelComponent.value && currentPanelComponent.value.__name) {
    return drawerHeightMap[currentPanelComponent.value.__name] || 'auto' // Fallback to 'auto' or a default
  }
  return 'auto'
})

function openDrawer(p, t) {
  activePost.value = null
  showDrawer.value = true
  if (t === 'mentions') {
    panelTitle.value = 'Mentions'
    currentPanelComponent.value = MentionsPanel
  }
  if (t === 'links') {
    panelTitle.value = 'Links'
    currentPanelComponent.value = LinksPanel
  }
  activePost.value = p
}

const { user } = defineProps({
  user: Object,
})

async function fetchPosts(isFirst = false) {
  if (
    (isFirst && initialLoading.value === false) ||
    (!isFirst && loadingMore.value) ||
    !hasMore.value
  ) {
    return
  }

  if (isFirst) {
    initialLoading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const { data } = await api.get(`api/posts/${user.id}/${cursor.value}/${limit.value}`)

    data.posts.forEach((p) => {
      p.videoReady = false
      p.showMore = false
      if (p.myLikes.length > 0) {
        p.likedByMe = true
      } else {
        p.likedByMe = false
      }
    })

    //console.log(data)
    posts.value.push(...data.posts)

    if (data.nextCursor == null) {
      hasMore.value = false
    } else {
      cursor.value = data.nextCursor
    }
  } finally {
    if (isFirst) initialLoading.value = false
    else loadingMore.value = false
  }
}

onMounted(() => {
  fetchPosts(true)
})

defineExpose({
  fetchPosts,
})
</script>

<style scoped lang="scss">
.post-body {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  transition: max-height 0.3s ease;
  white-space: pre-wrap;
  &.collapsed {
    -webkit-line-clamp: 5; // limit to 4 lines
    max-height: calc(1.2em * 5); // roughly 4 lines × line-height
  }
}

.show-more-btn {
  border: none;
  background: none;
  color: green;
  cursor: pointer;
  padding: 0;
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
