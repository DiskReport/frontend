<template>
    <div>
        <h2>Login</h2>
        <b-form ref="loginForm" @submit.prevent="userLogin">
            <b-form-input
                placeholder="Email"
                v-model="email"
                >
            </b-form-input>
            <b-form-input
                type="password"
                placeholder="Password"
                v-model="password"
                >
            </b-form-input>
            <b-button type="submit" variant="primary">Login</b-button>
            <b-alert
                variant="danger"
                :show="dismissCountDown"
                dismissible
                @dismissed="dismissCountDown=0"
                @dismiss-count-down="countDownChanged"
                >{{error}}</b-alert>
        </b-form>
        <h2>Want to try ?</h2>
        <b-button variant="success" v-on:click="demoLogin">Use the demo account</b-button>
    </div>
</template>

<style scoped>
.login-button {
    border: 0;
};
</style>

<script>
import axios from 'axios'

export default {
    layout: 'login',
    data() {
        return {
            email: '',
            password: '',
            error: null,
            dismissSecs: 3,
            dismissCountDown: 0
        }
    },
    methods: {
        async userLogin() {
            try {
              let response = await this.$auth.loginWith('local', { 
                  data: {
                    email: this.email,
                    password: this.password
                  }
              });
            } catch (err) {
              console.log(err)
              this.error="Forbidden"
              this.showAlert()
            }
        },
        countDownChanged(dismissCountDown) {
            this.dismissCountDown = dismissCountDown
        },
        showAlert() {
            this.dismissCountDown = this.dismissSecs
        },
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
    }
}
</script>

<style>
.login-form {
  margin: auto;
  width: 30%;
  padding: 10px;
  margin-top: 7%;
}
#components-login .login-form-button {
  width: 100%;
}
</style>
