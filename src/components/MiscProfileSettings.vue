<template>
  <div class="profile-footer q-pa-sm">
    <q-list bordered class="rounded-borders">
      <!-- Privacy Settings -->
      <q-item clickable v-ripple @click="$emit('navigate', 'privacy')">
        <q-item-section avatar>
          <q-icon name="lock" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Privacy Settings</q-item-label>
          <q-item-label caption>Manage your privacy preferences</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section> </q-item
      ><!-- Notification Settings -->
      <q-item clickable v-ripple @click="$emit('navigate', 'notifications')">
        <q-item-section avatar>
          <q-icon name="notifications" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Notifications</q-item-label>
          <q-item-label caption>Customize notification preferences</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <!-- Language Preferences -->
      <q-item clickable v-ripple @click="$emit('navigate', 'language')">
        <q-item-section avatar>
          <q-icon name="language" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Language</q-item-label>
          <q-item-label caption>Select your preferred language</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <!-- Theme Selection -->
      <q-item clickable v-ripple @click="$emit('navigate', 'theme')">
        <q-item-section avatar>
          <q-icon name="palette" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Theme</q-item-label>
          <q-item-label caption>Choose light or dark mode</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <!-- Two-Factor Authentication -->
      <q-item clickable v-ripple @click="$emit('navigate', 'twofactor')">
        <q-item-section avatar>
          <q-icon name="security" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Two-Factor Authentication</q-item-label>
          <q-item-label caption>Enable or manage 2FA</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <!-- Connected Apps -->
      <q-item clickable v-ripple @click="$emit('navigate', 'apps')">
        <q-item-section avatar>
          <q-icon name="apps" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Connected Apps</q-item-label>
          <q-item-label caption>Manage third-party integrations</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <!-- Help & Support -->
      <q-item clickable v-ripple @click="$emit('navigate', 'help')">
        <q-item-section avatar>
          <q-icon name="help_outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Help & Support</q-item-label>
          <q-item-label caption>Get assistance and find FAQs</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <!-- About -->
      <q-item clickable v-ripple @click="$emit('navigate', 'about')">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>About</q-item-label>
          <q-item-label caption>Learn more about this application</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script setup>
//import { defineEmits } from 'vue'
//const emit = defineEmits(['navigate'])
</script>
<style scoped>
.profile-footer {
  position: relative;
  background-color: transparent;
}
</style>
