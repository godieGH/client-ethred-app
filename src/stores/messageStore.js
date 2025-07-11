import { defineStore } from 'pinia'

export const useMessageStore = defineStore('messageStore', {
  state: () => ({
    queue: [],
    incoming: [],
  }),
})
