const state = {
  loading: false
}

const mutations = {
  START_LOADING (state) {
    console.log("START_LOADING_M")
    state.loading = true
  },
  STOP_LOADING (state) {
    console.log("STOP_LOADING_M")
    state.loading = false
  }
}

const actions = {
  startLoading ({ commit }) {
    console.log("START_LOADING")
    commit('START_LOADING')
  },
  stopLoading ({ commit }) {
    console.log("STOP_LOADING")
    commit('STOP_LOADING')
  }
}

const getters = {
  loading: state => state.loading
}

export default {
  state,
  getters,
  actions,
  mutations
}
