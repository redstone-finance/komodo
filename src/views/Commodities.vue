<template>
  <div class="commodities">
    <h1 class="text-center">Synthetic commodities</h1>
    <p class="text-center description">
      Here we can add a short description of komodo and how it works. Somtehing similar to
      <a href="https://synthetix.io/synths" target="_blank">
        the synths page
      </a>
    </p>

    <div class="tabs-container">
      <v-tabs v-model="tabIndex" centered>
        <v-tab v-for="category in categories" :key="category">
          {{ category }}
        </v-tab>
      </v-tabs>
    </div>

    <CommoditiesCards :commodities="commodities" />
  </div>
</template>

<script>
// @ is an alias to /src
import redstone from "redstone-api";
import CommoditiesCards from '@/components/CommoditiesCards.vue'
import commoditiesData from "@/assets/data/commodities.json"

export default {
  name: 'commodities',

  data() {
    return {
      tabIndex: 0,
    };
  },

  async created() {
    if (Object.keys(this.prices).length === 0) {
      const prices = await redstone.getAllPrices({
        provider: "redstone-stocks",
      });
      this.$store.dispatch('updatePrices', prices);
    }
  },

  computed: {
    commodities() {
      const tokens = [];
      for (const symbol in commoditiesData) {
        const commodity = commoditiesData[symbol];
        if (["all", commodity.tags[0]].includes(this.selecteddTab)) {
          tokens.push({
            ...commodity,
            symbol,
            price: this.prices[symbol],
          });
        }
      }
      return tokens;
    },

    categories() {
      const categories = ["all"];
      for (const commodity of Object.values(commoditiesData)) {
        const category = commodity.tags[0];
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
      return categories;
    },

    selecteddTab() {
      return this.categories[this.tabIndex];
    },

    prices() {
      return this.$store.state.prices;
    },
  },

  components: {
    CommoditiesCards,
  }
}
</script>

<style lang="scss" scoped>
h1 {
  // font-size: 20px;
  font-weight: 700;
  font-size: 30px;
  margin-top: 14px;
  color: #333;
}

.description {
  max-width: 300px;
  margin: auto;
  color: #777;
  font-size: 12px;
  margin-bottom: 10px;
}

</style>
