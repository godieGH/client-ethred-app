<template>
  <div class="conversation-list">
    <div class="q-pa-sm conversation-list-header">
      <div v-if="initialLoading" style="display: flex">
        <q-skeleton
          v-for="n in 3"
          :key="n"
          type="rect"
          width="80px"
          height="32px"
          style="border-radius: 20px"
          class="q-mx-xs"
        />
      </div>
      <div v-else style="display: flex; gap: 5px">
        <div
          class="filter-btn"
          :style="activeTab == f ? 'background: var(--q-secondary); color: #fff;' : ''"
          v-for="f in filters"
          @click="fetchTabData(f)"
          :key="f"
        >
          {{ f }}
        </div>
      </div>
    </div>
    <div class="conversation-list-content-area">
      <div v-if="initialLoading">
        <q-card v-for="n in 20" :key="n" flat class="q-mb-sm q-hoverable" style="cursor: pointer">
          <q-card-section class="row items-center no-wrap q-py-sm">
            <q-item-section avatar>
              <q-skeleton type="QAvatar" size="48px" />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" width="60%" class="text-weight-bold" />
              </q-item-label>
              <q-item-label caption class="q-mt-xs">
                <q-skeleton type="text" width="90%" />
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <q-skeleton type="text" width="45px" class="q-mb-xs" />
              <q-skeleton type="circle" size="20px" width="20px" class="q-ml-auto" />
            </q-item-section>
          </q-card-section>
        </q-card>
      </div>
      <div v-else>
        <q-card
          v-for="convo in myConversations"
          :key="convo.id"
          flat
          class="q-mb-sm q-hoverable"
          style="cursor: pointer"
          @click="selectConversation(convo.id, convo.type)"
        >
          <q-card-section class="row items-center no-wrap q-py-sm">
            <q-item-section avatar>
              <q-avatar size="48px">
                <img :src="getAvatarSrc(convo.participants[0].user.avatar)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <span class="text-grey">{{ convo.participants[0].user.name }}</span>
              </q-item-label>
              <q-item-label class="q-mt-xs">
                <div v-if="convo.messages.length === 0">👋 Hi there...</div>
                <div v-else>{{ JSON.parse(convo.messages[0].content).text }}</div>
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <span style="font-size: 10px" class="q-mb-xs">
                {{ formatTime(convo.last_message_at) }}
              </span>
              <span
                style="font-size: 10px; border-radius: 50px; background: green; color: white"
                class="q-pa-xs"
                >30</span
              >
            </q-item-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAvatarSrc, formatTime } from 'src/composables/formater'
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const emit = defineEmits(['selectConversation'])

const initialLoading = ref(true)
const filters = ref(['Private', 'Groups', 'Business'])
const activeTab = ref('Private')

const myConversations = ref([])

function fetchTabData(filter) {
  activeTab.value = filter
  fetchConversation()
}

async function fetchConversation() {
  if (activeTab.value === 'Private') {
    let type = 'private'
    try {
      const { data } = await api.get(`/api/get/all/user/conversations/${type}`)
      //console.log(data)
      myConversations.value = [...data]
    } catch (err) {
      console.log(err.message)
    } finally {
      initialLoading.value = false
    }
  }
}

function selectConversation(convo_id, type) {
  emit('selectConversation', convo_id, type)
}

onMounted(() => {
  fetchConversation()
})
</script>

<style scoped lang="scss">
.conversation-list {
  height: calc(100dvh - 70px);
  display: flex;
  flex-direction: column;

  .conversation-list-header {
    flex-shrink: 0;
    .filter-btn {
      border: 1px solid;
      border-radius: 20px;
      padding: 5px 8px;
      font-weight: 500;
      &:active {
        transform: scale(0.95);
      }
    }
  }

  .conversation-list-content-area {
    flex-grow: 1; /* Allows this area to take up all remaining space */
    overflow-y: auto; /* **This is the key for scrolling!** */
    padding-bottom: 20px; /* Increased padding to ensure content clears the FAB */
  }
}
</style>
