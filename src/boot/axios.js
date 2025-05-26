// Quasar CLI + Vite
import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// 1. Create an Axios instance with credentials enabled
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL, // e.g. 'https://api.myapp.com'
  withCredentials: true, // ← include cookies on cross-site
})

export default defineBoot(({ app }) => {
  // 2. Expose for Options API
  app.config.globalProperties.$axios = axios // default axios
  app.config.globalProperties.$api = api // your preconfigured instance

  // 3. Expose for Composition API via provide/inject
  app.provide('axios', axios)
  app.provide('api', api)
})

export { axios, api }
