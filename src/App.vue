<template>
   <q-layout>
      <router-view />
   </q-layout>
</template>

<script setup>
   import {
      onMounted
   } from "vue"
   import {
      useRouter
   } from 'vue-router'
   import axios from "axios"
   axios.defaults.withCredentials = true
   const baseUrl = import.meta.env.VITE_API_BASE_URL


   const router = useRouter()


   onMounted(async () => {
      try {
         console.log(baseUrl)
         const res = await axios.post(`${baseUrl}/users/token/refresh`)
         axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
         //redirect user to access the pages and data
         
         console.log(res.data)
      } catch(err) {
         if (err) {
            router.push('/login')
         }
      }
   })



</script>