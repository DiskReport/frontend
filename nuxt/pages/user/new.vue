<template>
    <div>
        <h2>Register</h2>
        <b-form @submit="onSubmit">
            <b-form-input
                placeholder="Email"
                type="email"
                v-model="form.email"
                @keyup="checkEmail"
                :state="state.email"
                ></b-form-input>
            <b-form-input
                placeholder="Username"
                v-model="form.username"
                @keyup="checkUsername"
                :state="state.username"
                ></b-form-input>
            <b-form-input
                placeholder="Password"
                type="password"
                v-model="form.password"
                @keyup="checkPassword"
                :state="state.password"
                ></b-form-input>
            <b-button type="submit" variant="primary" :disabled="createDisabled">Create</b-button>
        </b-form>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    components: {
    },
    data() {
        return {
            form: {
                username: '',
                password: '',
                email: ''
            },
            state: {
                username: null,
                password: null,
                email: null,
            }
        }
    },
    computed: {
	createDisabled () {
            if (this.state.username && this.state.email && this.state.password) {
                return false;
            } else {
                return true;
            }
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            axios.post('/api/user', this.form)
            .then(response => {
                const ret = response.data;
                console.log("user created")
                console.log(response.data);
                this.$router.push("/user/login");
            }).catch(error => {
                console.log(error);
            })
        },
        checkUsername() {
             axios.post('/api/user/exist', {
                        username: this.form.username
                    })
                    .then(async response => {
                      if(response.data.exist == false){
                        this.state.username=true
                      }else{
                        this.state.username=false
                      }
                    })
                    .catch(function (error) {
                      console.log(error);
                    });
        },
        checkEmail() {
             var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
             if (re.test(this.form.email)) {
                 axios.post('/api/user/exist', {
                            email: this.form.email
                        })
                        .then(async response => {
                          if(response.data.exist == false){
                            this.state.email=true
                          }else{
                            this.state.email=false
                          }
                        })
                        .catch(function (error) {
                          console.log(error);
                        });
             } else {
                 this.state.email=false
             }
        },
        checkPassword() {
            if (this.form.password.length >= 8) {
                this.state.password=true
            } else {
                this.state.password=false
            }
        }
        
    }
}
</script>

<style>
</style>

