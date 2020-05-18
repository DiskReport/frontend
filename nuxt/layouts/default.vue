<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#" to="/">
        <img src="/img/diskreport-4x.png" class="d-inline-block align-top" alt="DiskReport" width="32" height="32"/>
        DiskReport
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav v-if="$auth.loggedIn">
          <b-nav-item href="#" to="/">Hosts</b-nav-item>
          <b-button variant="success" to="/host/add">Add a new host</b-button>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">

          <b-navbar-nav v-if="!$auth.loggedIn">
            <b-nav-item href="#" to="/user/login">Login</b-nav-item>
            <b-nav-item href="#" to="/user/new">Register</b-nav-item>
          </b-navbar-nav>

          <b-nav-item-dropdown right v-if="$auth.user && $auth.user.admin">
            <template v-slot:button-content>
              <em>Administration</em>
            </template>
            <b-dropdown-item href="#" to="/user">Users</b-dropdown-item>
            <b-dropdown-item href="#" to="/host">Hosts</b-dropdown-item>
            <b-dropdown-item href="#" to="/host/non_claimed">Non claimed hosts</b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown right v-if="$auth.loggedIn">
            <template v-slot:button-content>
              <em>{{$auth.user.username}}</em>
            </template>
            <b-dropdown-item href="#" @click="$auth.logout()">Logout</b-dropdown-item>
          </b-nav-item-dropdown>

        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <nuxt/>
  </div>
</template>
