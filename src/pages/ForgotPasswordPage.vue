<template>
   <q-btn @click="my" color="primary">
      Click Me
   </q-btn>
</template>
<script setup>
   import axios from "axios"
   
   async function my() {
      const res = await axios.get("http://localhost:3000")
      console.log(res.data)
   }
</script>