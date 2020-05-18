<template>
  <div>
    <div v-if="$auth.loggedIn">
      <HostSelect v-bind:host="$store.state.host" v-bind:path="$store.state.path" v-bind:ts="$store.state.ts"/>
    </div>
    <div v-if="!$auth.loggedIn">
      <h2>Screenshots</h2>
      <gallery :images="images" :index="index" @close="index = null"></gallery>
        <div
          class="image"
          v-for="image, imageIndex in images"
          @click="index = imageIndex"
          :style="{ backgroundImage: 'url(' + image + '-small.png)', width: '300px', height: '174px' }"
          ></div>
      <div style="clear:both"/>

      <h2>Want to try ?</h2>
      <b-button variant="success" size="lg" v-on:click="demoLogin">Use the demo account</b-button>
      </p>

      <h2>Features</h2>

      <h3>Browse your directory tree</h3>
      <p>DiskReport is a disk space usage report tool to analyse your disk space usage.
      </p>

      <h3>Cleaning advice</h3>
      <p>DiskReport gives you cleaning advice to help you clean your disk space. It can be about OS updates packages, logfiles rotation, MySQL binary logs…
      </p>

      <h3>Disk usage history</h3>
      <p>History analysis reports allow to quickly analyse disk space usage variation since previous reports and find gorwing files.
      </p>

      <h3>Online report</h3>
      <p>DiskReport is an online tool to get a visual representation of your disk space usage.
      </p>

      <h3>No space needed</h3>
      <p>DiskReport can be run as one-liner command, usefull when disk is full. As the report is fully online you don't need space to archive reports.
      </p>

      <h3>Linux and Mac</h3>
      <p>DiskReport works on Linux and Mac !
      </p>
    </div>
  </div>
</template>

<script>
import HostSelect from '../components/host-select.vue'

export default {
    data: function () {
        return {
            images: [
                '/img/screen1.png',
                '/img/screen2.png',
                '/img/screen3.png',
                '/img/screen4.png',
            ],
            index: null
        };
    },
    components: {
        HostSelect,
    },
    methods: {
        async demoLogin() {
            try {
              let response = await this.$auth.loginWith('local', { 
                  data: {
                    email: 'demo@demo.demo',
                    password: 'demonstration'
                  }
              });
            } catch (err) {
              console.log(err)
              this.error="Forbidden"
              this.showAlert()
            }
        },
    },
}
</script>

<style>
.image {
    float: left;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    border: 1px solid #ebebeb;
    margin: 5px;
}
</style>
