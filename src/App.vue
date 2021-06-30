<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      dense
      flat
    >
      <!-- <div > -->
        <a class="logo-link d-flex align-center" href="/#/">
          <v-img
            alt="Komodo Logo"
            class="shrink mr-2"
            contain
            src="komodo-icon.png"
            transition="scale-transition"
            width="40"
          />
          <h2>Komodo</h2>
        </a>
      <!-- </div> -->

      <v-spacer></v-spacer>

      <a class="nav-link" href="/#/commodities">
        <span>
          All commodities
        </span>
        <v-icon
            right
            dark
          >
            mdi-finance
          </v-icon>
      </a>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Vue from 'vue';
import blockchain from '@/helpers/blockchain';

const checkEthereumNetwork = async () => {
  const name = await blockchain.getNetworkName();
  if (name !== "kovan") {
    alert("Please switch to kovan network");
  }
};

export default Vue.extend({
  name: 'App',

  data: () => ({
    //
  }),

  async mounted() {
    await checkEthereumNetwork();
    blockchain.onNetworkChange(() => {
      checkEthereumNetwork();
    });
  },

});
</script>

<style lang="scss">

* {
  font-family: "Poppins", "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

.logo-link {
  text-decoration: none;
  h2 {
    color: white;
  }
}

a.nav-link {
  text-decoration: none;

  span {
    color: white;
  }

  &:hover {
    span {
      text-decoration: underline;
    }
  }
}

</style>
