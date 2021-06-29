import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    prices: {},
    liquidity: {},
    liquidityLoadingCompleted: false,
  },
  mutations: {
    updatePrices(state, payload) {
      state.prices = payload;
    },

    setLiquidityForToken(state, payload) {
      state.liquidity = {
        ...state.liquidity,
        [payload.symbol]: payload.liquidity,
      };
    },

    completeLiquidityLoading(state) {
      state.liquidityLoadingCompleted = true;
    }
  },
  actions: {
    updatePrices({ commit }, prices) {
      commit('updatePrices', prices);
    },

    setLiquidityForToken({ commit }, { symbol, liquidity }) {
      commit('setLiquidityForToken', { symbol, liquidity });
    },

    completeLiquidityLoading({ commit }) {
      commit('completeLiquidityLoading');
    },
  },
});
