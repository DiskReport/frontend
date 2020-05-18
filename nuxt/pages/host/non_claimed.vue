<template>
  <div>
    <h1>Non claimed hosts list</h1>
    <div v-for="host in hosts">uuid: {{host.uuid}} hostname: {{host.hostname}} date_count: {{host.date_count}}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
    async asyncData ({ params }) {
        const { data } = await axios.get('/api/host/non_claimed')
        return { hosts: data }
    }
}
</script>

<style>
</style>

