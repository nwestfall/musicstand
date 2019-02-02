<template>
    <div>
        <div class="title">My Schedules</div>
        <div @click="openStand(item)" class="schedule-item" v-for="item in schedules">
          <h3>{{item.attributes.dates}}</h3>
          <p>{{item.attributes.service_type_name}} - {{item.attributes.team_name}}: {{item.attributes.team_position_name}}</p>
        </div>
    </div>
</template>

<script>
  const settings = require('electron-settings');
  const axios = require('axios')
  import { isNullOrUndefined } from 'util'
  import { mapGetters, mapActions } from 'vuex'
  import { checkAndRefreshToken } from '../../../main/auth';

  export default {
    data () {
      return {
        person: settings.get('person'),
        schedules: []
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
      getSchedules() {
        var that = this;

        if(!isNullOrUndefined(that.$data.person)) {
          that.startLoading()
          checkAndRefreshToken().then(function(tokenInfo) {
            axios.get('https://api.planningcenteronline.com/services/v2/people/' + that.$data.person.id + '/schedules', {
              headers: { 'Authorization': `Bearer ${tokenInfo.access_token}` }
            }).then(function(resp) {
              if(resp.data.data && resp.data.data.length > 0) {
                that.$data.schedules = resp.data.data.sort(function(a, b) {
                  if(a.attributes.dates != b.attributes.dates)
                    return a.attributes.dates >= b.attributes.dates
                  else
                    return a.attributes.service_type_name >= b.attributes.service_type_name
                })
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
      },
      openStand(schedule) {
        this.$router.push({ name: 'stand', params: { schedule }})
      }
    },
    created: function() {
      var that = this
      that.getSchedules()

      settings.watch('person', (nv, ov) => {
        that.$data.person = nv
        that.getSchedules()
      })
    }
  }
</script>

<style scoped>
  .title {
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
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

  .schedule-item {
    border: 1px solid #fff;
    border-radius: 0.5em;
    padding: 15px;
    margin-bottom: 20px;
    cursor: pointer;
    color: #fff;
  }

  .schedule-item:hover {
    background-color: #fff;
    color: #333;
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
