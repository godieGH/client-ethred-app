<template>
  <q-layout view="hHh lpR fFf">
    <!-- Fixed Header with theme-aware classes -->
    <q-header elevated :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-primary']">
      <q-toolbar>
        <q-toolbar-title>
          <img style="margin: 6px 0 0 8px" src="~assets/logo.png" height="45" /> </q-toolbar-title
        ><q-btn flat dense round icon="search" aria-label="Search" />
        <q-btn
          flat
          dense
          round
          :icon="modeIcon"
          @click="toggleDarkMode"
          aria-label="Toggle theme"
        />
        <q-btn flat dense round icon="settings" aria-label="Settings" />
      </q-toolbar>

      <q-tabs
        dense
        align="justify"
        narrow-indicator
        :class="$q.dark.isActive ? 'text-white' : 'text-primary'"
      >
        <q-route-tab to="/people" label="People" />
        <q-route-tab to="/" exact label="For You" />
        <q-route-tab to="/profile" label="Profile" />
      </q-tabs>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()

// This drives the theme-toggle button icon
const modeIcon = ref('')

// Initialize auth & theme once
onMounted(async () => {
  //console.log(userStore.user)
  const needLogin = await userStore.initialize()
  if (needLogin) {
    router.push('/auth/login')
    return
  }

  // Set initial dark mode & icon
  $q.dark.set(userStore.preferences.themeDark)
  modeIcon.value = $q.dark.isActive ? 'light_mode' : 'dark_mode'
})

function toggleDarkMode() {
  const isDark = !$q.dark.isActive
  $q.dark.set(isDark)
  modeIcon.value = isDark ? 'light_mode' : 'dark_mode'
  userStore.setUserPreferences(isDark ? 'dark' : 'light')
}
</script>
<style scoped>
/* No additional scoped styles needed; Quasar theme classes handle colors */
</style>
