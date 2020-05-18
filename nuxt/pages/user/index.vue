<template>
  <div>
    <h1>Users list</h1>
    <div v-for="user in users">id: {{user.id}} username: {{user.username}}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
    async asyncData ({ params }) {
        const { data } = await axios.get('/api/user')
        return { users: data }
    }
}
</script>

<style>
</style>

