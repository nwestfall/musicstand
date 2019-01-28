<template>
  <div id="wrapper">
    <h1 id="header">music stand</h1>
    <main>
      <div class="left-side">
        <span class="title">
          Welcome to Music Stand for Desktop!
        </span>
        <info></info>
      </div>

      <div class="right-side">
        <schedules></schedules>
      </div>
    </main>
  </div>
</template>

<script scoped>
  import Info from './LandingPage/Info'
  import Schedules from './LandingPage/Schedules'

  const settings = require('electron-settings');

  export default {
    name: 'landing-page',
    components: { Info, Schedules },
    data() {
      return {
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    },
    created: function() {
      var that = this;
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { 
    font-family: 'Source Sans Pro', sans-serif; 
    background: rgb(63,130,211);
  }

  #header {
    color: #fff;
    text-align: center;
    font-size: 62px;
    padding: 20px;
    margin-bottom: 20px;
  }

  #sub-header {
    color: #fff;
    text-align: center;
    font-size: 48px;
    padding: 20px;
    margin-bottom: 20px;
  }

  #wrapper {
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: rgb(255, 255, 255);
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: #fff;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #fff;
    border: 1px solid #fff;
    background-color: transparent;
  }
</style>
