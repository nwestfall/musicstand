<template>
    <div>
        <div class="title">Control Panel</div>
        <div class="items">
          <div class="item">
            <div class="name">Current Email:</div>
            <div class="value">{{email}}</div>
          </div>
          <div class="item" v-if="person && person.attributes">
            <div class="name">Name:</div>
            <div class="value">{{person.attributes.name}}</div>
          </div>
          <div class="item" v-if="person">
            <div class="name">Reference ID:</div>
            <div class="value">{{person.id}}</div>
          </div>
          <div class="item">
            <button class="alt" @click="getPerson(true)">Refresh Profile</button>
          </div>
        </div>
    </div>
</template>

<script>
  const settings = require('electron-settings');
  const axios = require('axios');
  import { isNullOrUndefined } from 'util'
  import { mapGetters, mapActions } from 'vuex'
  import { checkAndRefreshToken } from '../../../main/auth';

  export default {
    data () {
      return {
        email: settings.get('email'),
        person: settings.get('person')
      }
    },
    methods: {
      ...mapActions([
        'startLoading',
        'stopLoading'
      ]),
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      getPerson(force) {
        var that = this
        let email = this.$data.email
        let person = this.$data.person
        if(force || (email != '' && isNullOrUndefined(person)))
        {
          that.startLoading()
          checkAndRefreshToken().then(function(tokenInfo) {
            axios.get('https://api.planningcenteronline.com/people/v2/me', {
              headers: { 'Authorization': `Bearer ${tokenInfo.access_token}` },
              crossDomain: true
            }).then(function(resp) {
              console.log(resp)
              if(resp.data.data) {
                person = resp.data.data
                settings.set('person', person)
              }
            }).catch(function(error) {
              console.error(error)
            }).then(function() {
              that.stopLoading()
            })
          }).catch(function(error) {
            console.error(error)
            that.stopLoading()
          })
        }
      }
    },
    created: function() {
      var that = this
      settings.watch('email', (nv, ov) => {
        that.$data.email = nv
        that.getPerson()
      })
      settings.watch('person', (nv, ov) => {
        that.$data.person = nv
      })
    },
    mounted: function() {
      this.getPerson()
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
