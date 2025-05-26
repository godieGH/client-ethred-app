<template>
  <q-page>
    <div class="q-px-lg">
      <q-card v-for="n in 10" :key="n" flat bordered style="max-width: 500px; margin: 10px 0">
        <q-item>
          <q-item-section avatar>
            <q-skeleton type="QAvatar" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" />
            </q-item-label>
            <q-item-label caption>
              <q-skeleton type="text" width="80%" />
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar />

          <q-item-section class="q-pl-sm">
            <q-skeleton height="150px" class="q-mb-sm" />

            <div class="row items-center justify-between no-wrap">
              <div class="row items-center">
                <q-icon name="chat_bubble_outline" color="grey-4" class="q-mr-sm" size="18px" />
                <q-skeleton type="text" width="30px" />
              </div>

              <div class="row items-center">
                <q-icon name="repeat" color="grey-4" class="q-mr-sm" size="18px" />
                <q-skeleton type="text" width="30px" />
              </div>

              <div class="row items-center">
                <q-icon name="favorite_border" color="grey-4" class="q-mr-sm" size="18px" />
                <q-skeleton type="text" width="30px" />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </q-page>
</template>
<script setup>
//import { useUserStore } from "stores/user"
//const userStore = useUserStore()

//console.log(userStore.user)
//console.log(userStore.token)
</script>
