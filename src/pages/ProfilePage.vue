<template>
  <q-page class="profile-page q-pa-md">
    <!-- PROFILE HEADER -->
    <div v-if="loading" class="profile-skeleton">
      <q-skeleton type="circle" class="avatar-skel" />
      <q-skeleton type="text" width="50%" />
      <q-skeleton type="text" width="70%" />
      <q-skeleton type="text" width="20%" height="50px" />
    </div>
    <div v-else class="profile-content column items-center text-center q-mb-md">
      <div class="avatar-wrapper">
        <q-avatar size="120px" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-3'">
          <img :src="user.avatar" />
        </q-avatar>
        <q-icon
          name="add"
          v-show="tab === 'settings'"
          class="edit-icon"
          :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-primary'"
          @click="focusAvatar"
        />
        <input
          type="file"
          ref="avatarInput"
          accept="image/*"
          @change="onAvatarSelected"
          style="display: none"
        />
      </div>
      <div class="name q-mt-sm text-h6">
        {{ user.name }}
      </div>
      <div class="username text-subtitle2 text-grey q-mt-xs">@{{ user.username }}</div>
      <div class="bio text-body2 text-grey q-mt-xs">
        {{ user.bio }}
      </div>
      <q-btn
        v-if="hasExtraInfo"
        flat
        small
        class="q-mt-sm"
        :label="showMore ? 'Less' : 'More'"
        :icon-right="showMore ? 'expand_less' : 'chevron_right'"
        @click="showMore = !showMore"
      />
      <div v-if="showMore" class="extra-info q-mt-sm text-body2 text-grey">
        <q-btn
          v-if="user.contact.phone"
          :href="`tel:${user.contact.phone}`"
          label="Call"
          icon="phone"
          type="a"
          style="font-size: 12px; border: 1px solid; padding: 0 20px"
          flat
          dense
        />
        <div v-if="user.contact.blog">
          Blog: <a :href="user.contact.blog" target="_blank">{{ user.contact.blog }}</a>
        </div>
        <div v-if="user.contact.twitter">
          Twitter:
          <a :href="`https://twitter.com/${user.contact.twitter}`" target="_blank"
            >@{{ user.contact.twitter }}</a
          >
        </div>
      </div>
    </div>
    <!-- COUNTS (only on posts tab) -->
    <div v-if="tab === 'posts'" class="counts-row q-my-md">
      <div class="count-box">
        <q-skeleton v-if="loadingCounts" type="text" width="40px" class="count-skel" />
        <div v-else class="count-value">
          {{ user.posts.length }}
        </div>
        <div class="count-label">Posts</div>
      </div>
      <div class="count-box">
        <q-skeleton v-if="loadingCounts" type="text" width="40px" class="count-skel" />
        <div v-else class="count-value">
          {{ user.following.length }}
        </div>
        <div class="count-label">Following</div>
      </div>
      <div class="count-box">
        <q-skeleton v-if="loadingCounts" type="text" width="40px" class="count-skel" />
        <div v-else class="count-value">
          {{ user.followers.length }}
        </div>
        <div class="count-label">Followers</div>
      </div>
    </div>

    <!-- TABS CONTENT -->
    <div class="tabs-container">
      <q-tab-panels v-model="tab" animated class="panel-content">
        <!-- POSTS -->
        <q-tab-panel name="posts" class="panel-content">
          <q-card v-for="post in user.posts" :key="post.id" class="q-mb-md">
            <q-card-section>
              <div class="text-h6">
                {{ post.title }}
              </div>
              <div class="text-subtitle2 text-grey">
                {{ post.date }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>{{ post.content }}</q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="following" class="panel-content">
          <div v-if="loadingFollowing">
            <div v-for="n in 7" :key="n" class="row items-center q-py-sm list-item">
              <q-skeleton type="circle" class="avatar-skel-small" />
              <q-skeleton type="text" width="30%" class="q-ml-sm" />
              <q-skeleton type="rect" width="20%" height="30px" class="q-ml-auto btn-skel" />
            </div>
          </div>

          <div v-else>
            <q-list>
              <q-item
                v-for="f in user.following"
                :key="f.id"
                class="row items-center q-py-sm list-item"
              >
                <!-- avatar section -->
                <q-item-section avatar circle>
                  <img :src="setSrcFollowing(f)" alt="avatar" class="avatar-skel-small" />
                </q-item-section>

                <!-- name/text section -->
                <q-item-section style="width: 30%">
                  {{ f.name }}
                </q-item-section>

                <!-- button section -->
                <q-item-section side class="q-ml-auto">
                  <q-btn
                    :label="f.isFollowing ? 'Unfollow' : 'Follow'"
                    size="sm"
                    unelevated
                    color="primary"
                    :disable="actionInProgress[f.id]"
                    @click.stop="toggleFollow(f)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-tab-panel>

        <!-- FOLLOWERS -->
        <q-tab-panel name="followers" class="panel-content">
          <div v-if="loadingFollowers">
            <div v-for="n in 7" :key="n" class="row items-center q-py-sm list-item">
              <q-skeleton class="avatar-skel-small" />
              <q-skeleton type="text" width="30%" class="q-ml-sm" />
              <!-- button skeleton -->
              <q-skeleton type="rect" width="20%" height="30px" class="q-ml-auto btn-skel" />
            </div>
          </div>

          <div v-else>
            <q-list>
              <q-item
                v-for="f in user.followers"
                :key="f.id"
                class="row items-center q-py-sm list-item"
              >
                <!-- avatar section -->
                <q-item-section avatar>
                  <img :src="setSrcFollowers(f)" alt="follower avatar" class="avatar-skel-small" />
                </q-item-section>

                <!-- name/text section -->
                <q-item-section style="width: 30%">
                  {{ f.name }}
                </q-item-section>

                <!-- follow-back button -->
                <q-item-section side class="q-ml-auto">
                  <q-btn
                    :label="f.isFollowing ? 'Unfollow' : 'Follow Back'"
                    size="sm"
                    unelevated
                    color="primary"
                    :disable="actionInProgress[f.id]"
                    @click.stop="toggleFollow(f)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-tab-panel>

        <!-- SETTINGS -->
        <q-tab-panel name="settings" class="panel-content">
          <q-form class="col-8" @submit.prevent="updateProfile">
            <q-input
              v-model="edit.name"
              label="Name"
              outlined
              bottom-slots
              hide-bottom-space
              :dense="true"
              :color="
                nameStatus.valid === true
                  ? 'positive'
                  : nameStatus.valid === false
                    ? 'negative'
                    : undefined
              "
              :error="nameStatus.valid === false"
              :success="nameStatus.valid === true"
              :input-props="commonInputProps"
              class="q-mb-sm"
            >
              <!-- error slot -->
              <template #error>
                <div class="text-negative text-caption">
                  {{ nameStatus.message }}
                </div>
              </template>

              <!-- success/info slot -->
              <template #after>
                <div v-if="nameStatus.valid === true" class="text-positive text-caption">
                  {{ nameStatus.message }}
                </div>
              </template>
            </q-input>

            <q-input
              v-model="edit.username"
              label="Username"
              outlined
              bottom-slots
              hide-bottom-space
              :rules="[validateUsernameFormat]"
              :loading="usernameStatus.loading"
              :error="usernameStatus.available === false"
              :success="usernameStatus.available === true"
              :color="
                usernameStatus.available === true
                  ? 'positive'
                  : usernameStatus.available === false
                    ? 'negative'
                    : undefined
              "
              class="q-mb-sm"
            >
              <!-- only shows when error=true -->
              <template #error>
                <div class="text-negative text-caption">
                  {{ usernameStatus.message }}
                </div>
              </template>

              <!-- only shows when success=true -->
              <template #after>
                <div
                  v-if="usernameStatus.available === true"
                  class="text-positive text-caption row items-center"
                >
                  <q-icon name="check_circle" size="14px" class="q-mr-xs" />
                  {{ usernameStatus.message }}
                </div>
              </template>
            </q-input>

            <q-input
              v-model="edit.bio"
              label="Bio"
              type="textarea"
              outlined
              bottom-slots
              hide-bottom-space
              :dense="true"
              :color="
                bioStatus.valid === true
                  ? 'positive'
                  : bioStatus.valid === false
                    ? 'negative'
                    : undefined
              "
              :error="bioStatus.valid === false"
              :success="bioStatus.valid === true"
              :input-props="commonInputProps"
              class="q-mb-sm"
            >
              <template #error>
                <div class="text-negative text-caption">
                  {{ bioStatus.message }}
                </div>
              </template>
              <template #after>
                <div v-if="bioStatus.valid === true" class="text-positive text-caption">
                  {{ bioStatus.message }}
                </div>
              </template>
            </q-input>

            <q-input
              v-model="edit.contact.blog"
              label="Blog URL"
              type="url"
              outlined
              bottom-slots
              hide-bottom-space
              :dense="true"
              :color="
                blogStatus.valid === true
                  ? 'positive'
                  : blogStatus.valid === false
                    ? 'negative'
                    : undefined
              "
              :error="blogStatus.valid === false"
              :success="blogStatus.valid === true"
              :input-props="commonInputProps"
              class="q-mb-sm"
            >
              <template #error>
                <div class="text-negative text-caption">
                  {{ blogStatus.message }}
                </div>
              </template>
              <template #after>
                <div v-if="blogStatus.valid === true" class="text-positive text-caption">
                  {{ blogStatus.message }}
                </div>
              </template>
            </q-input>

            <q-input
              v-model="edit.contact.twitter"
              label="Twitter Handle"
              outlined
              bottom-slots
              hide-bottom-space
              :dense="true"
              :color="
                twitterStatus.valid === true
                  ? 'positive'
                  : twitterStatus.valid === false
                    ? 'negative'
                    : undefined
              "
              :error="twitterStatus.valid === false"
              :success="twitterStatus.valid === true"
              :input-props="commonInputProps"
              class="q-mb-sm"
            >
              <template #error>
                <div class="text-negative text-caption">
                  {{ twitterStatus.message }}
                </div>
              </template>
              <template #after>
                <div v-if="twitterStatus.valid === true" class="text-positive text-caption">
                  {{ twitterStatus.message }}
                </div>
              </template>
            </q-input>

            <q-input
              v-model="edit.contact.phone"
              label="Phone Number"
              type="tel"
              outlined
              bottom-slots
              hide-bottom-space
              :dense="true"
              :color="
                phoneStatus.valid === true
                  ? 'positive'
                  : phoneStatus.valid === false
                    ? 'negative'
                    : undefined
              "
              :error="phoneStatus.valid === false"
              :success="phoneStatus.valid === true"
              :input-props="commonInputProps"
              class="q-mb-sm"
            >
              <template #error>
                <div class="text-negative text-caption">
                  {{ phoneStatus.message }}
                </div>
              </template>
              <template #after>
                <div v-if="phoneStatus.valid === true" class="text-positive text-caption">
                  {{ phoneStatus.message }}
                </div>
              </template>
            </q-input>
            <div class="q-mt-md" style="display: flex; justify-content: flex-end">
              <q-btn
                type="submit"
                label="Save"
                flat
                dense
                style="border: 1px solid; opacity: 0.6"
              />
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- TABS BAR -->
    <q-tabs
      v-model="tab"
      class="tabs-bar fixed-bottom"
      align="justify"
      dense
      :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-primary'"
    >
      <q-tab name="posts" :label="$q.screen.lt.md ? '' : 'Posts'" icon="article" />
      <q-tab name="following" :label="$q.screen.lt.md ? '' : 'Following'" icon="person_add" />
      <q-tab name="followers" :label="$q.screen.lt.md ? '' : 'Followers'" icon="people" />
      <q-tab name="settings" :label="$q.screen.lt.md ? '' : 'Settings'" icon="settings" />
    </q-tabs>
  </q-page>
</template>
<script setup>
import { ref, onMounted, watch, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user'
import { api } from 'boot/axios'
import { usePeopleStore } from 'stores/peopleStore'

const userStore = useUserStore()
const peopleStore = usePeopleStore()
const $q = useQuasar()
const loading = ref(true)
const loadingCounts = ref(true)
const loadingFollowing = ref(false)
const loadingFollowers = ref(false)
const tab = ref('posts')
const showMore = ref(false)
const actionInProgress = reactive({})

const usernameStatus = ref({
  // holds server/API state
  loading: false,
  available: null, // null = unchecked, true/false = result
  message: '', // server or validation message
})
let usernameTimeout = null
const nameStatus = ref({ valid: null, message: '' })
const bioStatus = ref({ valid: null, message: '' })
const blogStatus = ref({ valid: null, message: '' })
const twitterStatus = ref({ valid: null, message: '' })
const phoneStatus = ref({ valid: null, message: '' })
const commonInputProps = {
  autocapitalize: 'none',
  autocorrect: 'off',
  autocomplete: 'off',
  spellcheck: false,
  inputmode: 'verbatim',
}

const user = ref({
  avatar: '',
  name: '',
  username: '',
  bio: '',
  contact: {
    phone: '',
    blog: '',
    twitter: '',
  },
  posts: [],
  following: [],
  followers: [],
})
const edit = ref({
  name: '',
  username: '',
  bio: '',
  contact: {
    phone: '',
    blog: '',
    twitter: '',
  },
})
const avatarInput = ref(null)

const hasExtraInfo = computed(() => {
  const c = user.value.contact
  return c.phone || c.blog || c.twitter
})

function fetchProfile() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        avatar: userStore.user.avatar != null ? `/uploads/${userStore.user.avatar}` : 'default.png',
        name: userStore.user.name,
        username: userStore.user.username,
        bio: userStore.user.bio,
        contact: userStore.user.contact,
        posts: [
          /*{
            id: 1,
            title: 'Hello Vue!',
            date: '2025-05-10',
            content: 'My first post...',
          },
          {
            id: 2,
            title: 'Quasar Rocks',
            date: '2025-05-12',
            content: 'Building UI with Quasar...',
          },
        */
        ],
        following: userStore.following,
        followers: userStore.followers,
      })
    }, 1200)
  })
}

async function init() {
  await userStore.fetchUsersData()
  await userStore.fetchFollowers()
  await userStore.fetchFollowing()
  const profile = await fetchProfile()
  user.value = profile
  edit.value = {
    ...profile,
    contact: {
      ...profile.contact,
    },
  }
  loading.value = false
  setTimeout(() => {
    loadingCounts.value = false
  }, 500)
}

async function loadTabData(name) {
  if (name === 'following') {
    loadingFollowing.value = true
    setTimeout(() => {
      loadingFollowing.value = false
    }, 800)
  }
  if (name === 'followers') {
    loadingFollowers.value = true
    setTimeout(() => {
      loadingFollowers.value = false
    }, 800)
  }
}

watch(tab, (newTab) => {
  loadTabData(newTab)
})

// --- Validators ---
const validateName = (val) => {
  if (!val) {
    return 'Full name is required'
  }
  const regex = /^[A-Za-z'-]+(?:\s+[A-Za-z'-]+)+$/
  if (!regex.test(val)) {
    return 'Enter at least first and last name (letters, hyphens, apostrophes only)'
  }
  return null
}

const validateUsernameFormat = (val) => {
  if (!val) {
    return 'Username is required'
  }
  if (val.length < 4) {
    return 'At least 4 characters'
  }
  if (!/^[a-z0-9._]+$/.test(val)) {
    return 'Only lowercase letters, numbers, “.” and “_”'
  }
  return null
}

const validateBio = (val) => {
  if (val && val.length > 160) {
    return 'Bio must be 160 characters or less'
  }
  return null
}

const validatePhone = (val) => {
  if (val && !/^\+?[0-9\- ]{7,15}$/.test(val)) {
    return 'Enter a valid phone number'
  }
  return null
}

const validateURL = (val) => {
  if (val) {
    try {
      new URL(val)
      return null
    } catch {
      return 'Enter a valid URL'
    }
  }
  return null
}

const validateTwitter = (val) => {
  if (val && !/^@?(\w){1,15}$/.test(val)) {
    return 'Enter a valid Twitter handle (up to 15 chars, letters/numbers/underscore)'
  }
  return null
}

// --- Update Profile ---
async function updateProfile() {
  const { name, username, bio, contact } = edit.value

  // 1. Name
  let err = validateName(name)
  if (err) {
    $q.notify({ type: 'negative', message: err })
    return
  }

  // 2. Username
  err = validateUsernameFormat(username)
  if (err) {
    $q.notify({ type: 'negative', message: err })
    return
  }

  // 3. Bio
  err = validateBio(bio)
  if (err) {
    $q.notify({ type: 'negative', message: err })
    return
  }

  // 4. Contact.phone
  err = validatePhone(contact.phone)
  if (err) {
    $q.notify({ type: 'negative', message: err })
    return
  }

  // 5. Contact.blog URL
  err = validateURL(contact.blog)
  if (err) {
    $q.notify({ type: 'negative', message: err })
    return
  }

  // 6. Contact.twitter
  err = validateTwitter(contact.twitter)
  if (err) {
    $q.notify({ type: 'negative', message: err })
    return
  }

  // --- All validations passed! ---
  try {
    // Option A: merge locally

    // Option B: send to server
    await api.post('/users/edit/profile', edit.value)
    //console.log(res.data)

    user.value = {
      ...user.value,
      ...edit.value,
    }

    $q.notify({ type: 'positive', message: 'Profile updated!' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile. Please try again.',
    })
  }
}

function focusAvatar() {
  avatarInput.value.click()
}

async function onAvatarSelected(event) {
  const file = event.target.files[0]
  if (!file) {
    $q.notify({ type: 'warning', message: 'No file selected.' })
    return
  }

  // 1. Only images
  if (!file.type.startsWith('image/')) {
    $q.notify({ type: 'negative', message: 'Please select a valid image file.' })
    return
  }

  // 2. File size: 50 KB – 5 MB
  const sizeKB = file.size / 1024
  const sizeMB = file.size / (1024 * 1024)
  if (sizeKB < 50) {
    $q.notify({
      type: 'negative',
      message: `Image too small (${Math.round(sizeKB)} KB). Minimum 50 KB.`,
    })
    return
  }
  if (sizeMB > 5) {
    $q.notify({
      type: 'negative',
      message: `Image too large (${sizeMB.toFixed(1)} MB). Max 5 MB.`,
    })
    return
  }

  // 3. Check dimensions/aspect ratio
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = async () => {
      const { width, height } = img
      if (width < 128 || height < 128) {
        $q.notify({
          type: 'negative',
          message: `Image too small (${width}×${height}). Min 128×128.`,
        })
        return
      }
      const ratio = width / height
      if (Math.abs(ratio - 1) > 0.1) {
        $q.notify({ type: 'negative', message: 'Please use a nearly square image (1:1 aspect).' })
        return
      }

      // 4. Upload with progress toast
      const notif = $q.notify({
        message: 'Uploading avatar...',
        caption: '0%',
        spinner: true,
        timeout: 0,
        group: false,
      })

      try {
        const formData = new FormData()
        formData.append('avatar', file)

        await api.post('/users/upload/profile-picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            notif({ caption: `${percent}%` })
          },
        })

        // Success
        user.value.avatar = URL.createObjectURL(file)
        notif({
          spinner: false,
          icon: 'done',
          message: 'Avatar loaded successfully!',
          caption: '',
          timeout: 2000,
        })
      } catch (error) {
        console.error('Upload failed:', error)
        notif({
          spinner: false,
          icon: 'error',
          type: 'negative',
          message: 'Failed to upload avatar. Please try again.',
          timeout: 3000,
        })
      }
    }
    img.onerror = () => {
      $q.notify({ type: 'negative', message: 'Failed to load the image.' })
    }
    img.src = e.target.result
  }
  reader.onerror = () => {
    $q.notify({ type: 'negative', message: 'Error reading file.' })
  }
  reader.readAsDataURL(file)
}

watch(
  () => edit.value.username,
  (newUsername) => {
    edit.value.username = newUsername.toLowerCase()
  },
)

watch(
  () => edit.value.username,
  (newVal) => {
    // Reset status
    usernameStatus.value = { loading: false, available: null, message: '' }

    // Clear any pending timer
    clearTimeout(usernameTimeout)

    // First check local format
    const formatError = validateUsernameFormat(newVal)
    if (formatError) {
      usernameStatus.value.available = false
      usernameStatus.value.message = formatError
      return
    }

    // Debounce before hitting the server
    usernameStatus.value.loading = true
    usernameTimeout = setTimeout(async () => {
      try {
        const res = await api.post('/users/username/check', { username: newVal })
        const { available, message } = res.data
        usernameStatus.value.available = available
        usernameStatus.value.message = available ? 'Username is free!' : message || 'Taken'
      } catch {
        usernameStatus.value.available = false
        usernameStatus.value.message = 'Check failed. Try again.'
      } finally {
        usernameStatus.value.loading = false
      }
    }, 500)
  },
)

watch(
  () => edit.value.name,
  (val) => {
    const err = validateName(val)
    nameStatus.value.valid = !err
    nameStatus.value.message = err || 'Ok'
  },
)

watch(
  () => edit.value.bio,
  (val) => {
    const err = validateBio(val)
    bioStatus.value.valid = !err
    bioStatus.value.message = err || 'OK'
  },
)

watch(
  () => edit.value.contact.blog,
  (val) => {
    const err = validateURL(val)
    blogStatus.value.valid = !err
    blogStatus.value.message = err || 'OK'
  },
)

watch(
  () => edit.value.contact.twitter,
  (val) => {
    const err = validateTwitter(val)
    twitterStatus.value.valid = !err
    twitterStatus.value.message = err || 'OK'
  },
)

watch(
  () => edit.value.contact.phone,
  (val) => {
    const err = validatePhone(val)
    phoneStatus.value.valid = !err
    phoneStatus.value.message = err || 'OK'
  },
)

function setSrcFollowing(f) {
  const avatar = f.avatar
  let src
  src = avatar != null ? `/uploads/${avatar}` : 'default.png'
  return src
}

function setSrcFollowers(f) {
  const avatar = f.avatar
  let src
  src = avatar != null ? `/uploads/${avatar}` : 'default.png'
  return src
}

async function toggleFollow(u) {
  peopleStore.fetchAll()
  actionInProgress[u.id] = true
  console.log(peopleStore.people)
  try {
    if (u.isFollowing) {
      await peopleStore.unfollow(u.id)
      u.isFollowing = false
    } else {
      await peopleStore.follow(u.id)
      u.isFollowing = true
    }
  } catch (e) {
    console.error(e)
    // optional: notify user
  } finally {
    actionInProgress[u.id] = false
  }
}

onMounted(init)
</script>

<style scoped lang="scss">
.profile-page {
  max-width: 800px;
  margin: auto;
  display: flex;
  flex-direction: column;
}
.profile-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.avatar-skel {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}
.avatar-skel-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.avatar-wrapper {
  position: relative;
}
.edit-icon {
  position: absolute;
  font-size: 15px;
  font-weight: 1000;
  bottom: 5px;
  right: 14px;
  border-radius: 50%;
  border: 1px solid #555555;
  cursor: pointer;

  &:active {
    background: #ddd;
    transform: scale(0.92);
  }
}
.counts-row {
  display: flex;
  justify-content: space-around;
}
.count-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.count-value {
  font-size: 1.2rem;
  font-weight: 600;
}
.count-label {
  font-size: 0.8rem;
  color: gray;
}
.count-skel {
  height: 28px;
}
.tabs-container {
  padding-bottom: 56px;
}
.panel-content {
  padding-bottom: 16px;
}
.list-item {
  padding: 8px 0;
}
.btn-skel {
  border-radius: 4px;
}
.tabs-bar {
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  padding-bottom: 10px;
}
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}
.username {
  color: gray;
}
.extra-info a {
  text-decoration: none;
  color: $teal-base;
}

.username-input-wrapper {
  position: relative;
}

.username-input-wrapper .username-error,
.username-input-wrapper .username-success {
  position: absolute;
  left: 0;
  bottom: -18px; /* pull it up tight under the border */
  margin: 0;
}
</style>
