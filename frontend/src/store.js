import Vue from 'vue'
import Vuex from 'vuex'
import userModule from './modules/user.module.js'
import searchMoudle from './modules/search.module.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    searchMoudle,
    userModule,
  },
  state: {
    genre: ['Hip Hop', 'Rock', 'Disco', 'DubStep', 'Techno', 'Funk', 'Trap', 'World', 'Dance',
      'Classic', 'Pop', 'Other'],
  },
  getters: {
    getGenre: (state) => state.genre
  },
})
