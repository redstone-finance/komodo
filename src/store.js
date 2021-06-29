import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    prices: {},
  },
  mutations: {
    updatePrices(state, payload) {
      state.prices = payload;
    },
  },
  actions: {
    updatePrices({ commit }, prices) {
      commit('updatePrices', prices);
    },
  },
});
