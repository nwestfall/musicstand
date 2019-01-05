<template>
  <div id="app">
    <loading :active.sync="loading"
      :can-cancel="false"
      :is-full-page="true">
    </loading>
    <router-view></router-view>
  </div>
</template>

<script>
  import Loading from 'vue-loading-overlay'
  import 'vue-loading-overlay/dist/vue-loading.css'
  import { mapGetters, mapActions } from 'vuex'

  export default {
    name: 'musicstand',
    computed: mapGetters([
      'loading'
    ]),
    components: { Loading }
  }
</script>

<style>
  /* CSS */
  body {
    overflow-x: hidden;
  }
</style>
