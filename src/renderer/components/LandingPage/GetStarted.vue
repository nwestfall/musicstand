<template>
  <div>
    <div class="title">Let's get some quick information</div>
    <div id="get-started-main">
      <div class="left-side">
        <div class="items">
          <div class="item">
            <div class="name">Application ID:</div>
          </div>
          <div class="item">
            <div class="name">Secret:</div>
          </div>
          <div class="item">
            <div class="name">Email Address:</div>
          </div>
          <div class="item">
            <button class="alt" @click="getStarted(applicationId, secret, email)">Get Started</button>
          </div>
        </div>
      </div>
      <div class="right-side">
        <div class="items">
          <div class="item">
            <div class="value">
              <input name="applicationId" placeholder="application id" v-model="applicationId" />
            </div>
          </div>
          <div class="item">
            <div class="value">
              <input name="secret" placeholder="secret" type="password" v-model="secret" />
            </div>
          </div>
          <div class="item">
            <div class="value">
              <input name="email" placeholder="email address" type="email" v-model="email" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const settings = require('electron-settings');

  export default {
    data () {
      return {
        applicationId: settings.get('applicationId'),
        secret: settings.get('secret'),
        email: settings.get('email')
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      getStarted(applicationId, secret, email) {
        // TODO: Validate
        settings.set('applicationId', applicationId);
        settings.set('secret', secret);
        settings.set('email', email);
      }
    }
  }
</script>

<style scoped>
  .title {
    color: #fff;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  #get-started-main {
    display: flex;
    align-items: stretch;
  }

  .left-side {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .right-side {
    flex-grow: 7;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #fff;
    margin-right: 6px;
  }

  .item input {
    border-radius: 2em;
    border: 1px #6a6a6a solid;
    padding: 3px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .item input:focus {
    outline: none;
  }

  .item .value {
    color: #ccc;
    font-weight: bold;
  }

  button {
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

  button:hover {
    color: #fff;
    border: 1px solid #fff;
    background-color: transparent;
  }
</style>
