<template>
  <div id="wrapper">
    <div class="item">
        <button @click="backToSchedules()" v-if="!isFullScreen">Back to Schedules</button>
        <button class="alt right" @click="goFullscreen()" v-if="isFullScreen">Exit Fullscreen</button>
        <button class="alt right" @click="goFullscreen()" v-else>Go Fullscreen</button>
    </div>
    <h1 id="sub-header" v-show="!isFullScreen">{{ schedule.attributes.dates }} - {{ schedule.attributes.service_type_name }}</h1>
    <vue-tabs>
        <v-tab :title="song.song.attributes.title" v-for="song in songs">
            <div class="music">
                <h2>{{ song.song.attributes.title }}</h2>
                <br />
                <div class="row">
                    <div class="column" v-for="chart in song.formattedChordChart">
                        <span v-html="chart"></span>
                    </div>
                </div>
            </div>
        </v-tab>
    </vue-tabs>
  </div>
</template>

<script>
  const settings = require('electron-settings');
  const axios = require('axios')
  import { isNullOrUndefined } from 'util'
  import { mapGetters, mapActions } from 'vuex'
  import { VueTabs, VTab } from 'vue-nav-tabs/dist/vue-tabs.js'
  import 'vue-nav-tabs/themes/vue-tabs.css'

  export default {
    name: 'stand',
    data() {
        return {
            isFullScreen: false,
            schedule: this.$route.params.schedule,
            songs: []
        }
    },
    components: {
        VueTabs,
        VTab
    },
    methods: {
        ...mapActions([
            'startLoading',
            'stopLoading'
        ]),
        open (link) {
            this.$electron.shell.openExternal(link)
        },
        goFullscreen () {
            this.$data.isFullScreen = !this.$data.isFullScreen
            this.$electron.remote.getCurrentWindow().setFullScreen(this.$data.isFullScreen)
        },
        backToSchedules () {
            this.$router.push('/')
        },
        formatSong (song) {
            // split into columns
            let formattedSong = song.split('COLUMN_BREAK')
            for(var i = 0; i < formattedSong.length; i++) {
                // replace section titles
                formattedSong[i] = formattedSong[i].replace(/(INTRO ?[0-9]?[:]?|Intro ?[0-9]?[:]?|VERSE ?[0-9]?[:]?|Verse ?[0-9]?[:]?|PRE-CHORUS ?[0-9]?[:]?|CHORUS ?[0-9]?[:]?|Chorus ?[0-9]?[:]?|BRIDGE ?[0-9]?[:]?|Bridge ?[0-9]?[:]?|INSTRUMENTAL: ?[0-9]?[:]?|Instrumental: ?[0-9]?[:]?|TURN ?[0-9]?[:]?|[A-z]* *TAG ?[0-9]?[:]?)/g, "<strong>$1</strong>")
                // replace new lines
                formattedSong[i] = formattedSong[i].replace(/\n/g, "<br/>")
                // replace tabs
                formattedSong[i] = formattedSong[i].replace(/ /g, "&nbsp;")
                // replace chords
                formattedSong[i] = formattedSong[i].replace(/(\(*[CDEFGAB](?:b|bb)*(?:#|##|sus|maj|min|aug|m|M|°|[0-9])*[\(]?[\d\/]*[\)]?(?:[CDEFGAB](?:b|bb)*(?:#|##|sus|maj|min|aug|m|M|°|[0-9])*[\d\/]*)*\)*)(?![A-z])/g, "<strong>$1</strong>")
            }
            return formattedSong
        },
        getSongs () {
            var that = this

            that.startLoading()
            if(!isNullOrUndefined(that.$data.schedule)) {
                // get plan
                axios.get('https://api.planningcenteronline.com/services/v2/plans/' + that.$data.schedule.relationships.plan.data.id, {
                    headers: { 'Authorization': `Bearer ${settings.get('tokenInfo').access_token}` }
                }).then(function(resp) {
                    // get plan items
                    axios.get(resp.data.data.links.items + '?include=arrangement', {
                        headers: { 'Authorization': `Bearer ${settings.get('tokenInfo').access_token}` }
                    }).then(function(resp2) {
                        const songsInOrder = resp2.data.data.filter(function(i) {
                            return i.attributes.item_type == "song"
                        })
                        const arrangements = resp2.data.included.filter(function(i) {
                            return i.type == "Arrangement"
                        })

                        that.$data.songs = []
                        var arrangementsUsed = []
                        for(var i = 0; i < songsInOrder.length; i++) {
                            let song = songsInOrder[i]
                            let possibleArrangements = arrangements.filter(function(a) {
                                return a.id == song.relationships.arrangement.data.id
                            })
                            if(possibleArrangements.length == 1 && arrangementsUsed.indexOf(possibleArrangements[0].id) == -1) {
                                arrangementsUsed.push(possibleArrangements[0].id)
                                that.$data.songs.push({
                                    song: song,
                                    arrangement: possibleArrangements[0],
                                    formattedChordChart: that.formatSong(possibleArrangements[0].attributes.chord_chart)
                                })
                            }
                        }

                        var songItems = document.querySelector('.music')
                    }).catch(function(error2) {
                        console.error(error2)
                    }).then(function() {
                        that.stopLoading()
                    })
                }).catch(function(error) {
                    console.error(error)
                }).then(function() {
                })
            }
        }
    },
    created: function() {
        if(isNullOrUndefined(this.$data.schedule))
            this.$router.push('/')

        this.$data.isFullScreen = this.$electron.remote.getCurrentWindow().isFullScreen()

        this.getSongs()
    }
  }
</script>

<style>
  .music {
      background-color: #fff;
      padding: 10px;
  }

  .vue-tabs .nav > li.active span.title {
    color: rgb(63,130,211)
  }

  .vue-tabs .nav > li:hover span.title {
    color: rgb(63,130,211)
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
  
  button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
    background-color: transparent;
  }

  button.alt {
    color: #fff;
    background-color: #4fc08d;
  }

  button.alt:hover {
    color: #fff;
    background-color:transparent;
  }

  button:hover {
    color: #fff;
    background-color: #4fc08d;
    border: 1px solid #fff;
  }

  .right {
      float: right;
  }

  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .column {
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
  }

  .tab-container {
    display: block;
    animation: fadeIn 0.3s;
  }
</style>
