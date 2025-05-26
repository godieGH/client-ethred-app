// src/stores/user.js
import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { LocalStorage } from 'quasar'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    following: [],
    followers: [],
    preferences: {
      themeDark: LocalStorage.getItem('themeDark') || false,
    },
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    email: (state) => state.user?.email || '',
  },
  actions: {
    async initialize() {
      if (!this.isLoggedIn) {
        try {
          const res = await api.post('/users/token/refresh')
          this.user = res.data.user
          this.token = res.data.accessToken
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        } catch (err) {
          console.log(err.status)
          console.log(err)
          return true
        }
      }
    },

    async fetchUsersData() {
      try {
        const res = await api.post('/users/token/refresh')
        this.user = res.data.user
      } catch (err) {
        console.error(err)
      }
    },

    async fetchFollowing() {
      try {
        const res = await api.get('users/following/list')
        this.following = res.data
        console.log(res.data)
      } catch (err) {
        console.error(err)
      }
    },

    async fetchFollowers() {
      try {
        const res = await api.get('users/followers/list')
        console.log(res.data)
        this.followers = res.data
      } catch (err) {
        console.error(err)
      }
    },

    setUserPreferences(val) {
      if (val === 'dark') {
        this.preferences.themeDark = true
        LocalStorage.set('themeDark', true)
        //console.log(this.preferences)
      }
      if (val === 'light') {
        this.preferences.theme = false
        LocalStorage.set('themeDark', false)
        //console.log(this.preferences)
      }
    },

    setUser(userData, jwtToken) {
      this.user = userData
      this.token = jwtToken
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    },

    async clearUser() {
      try {
        const res = await api.post('/users/logout', this.user)
        console.log(res.data.message)
        this.user = null
        this.token = null
        //LocalStorage.remove("themeDark")
      } catch (err) {
        if (err) {
          console.log(err)
        }
      }
    },
  },
})
