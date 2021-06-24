<template>
  <div class="commodities">
    <h1 class="text-center">Synthetic commodities</h1>
    <p class="text-center description">
      Here we can add a short description of komodo and how it works. Somtehing similar to
      <a href="https://synthetix.io/synths" target="_blank">
        the synths page
      </a>
    </p>

    <CommoditiesCards :commodities="commodities" />
  </div>
</template>

<script>
// @ is an alias to /src
import CommoditiesCards from '@/components/CommoditiesCards.vue'
import commoditiesData from "@/assets/data/commodities.json"

export default {
  name: 'commodities',

  computed: {
    commodities() {
      const tokens = [];
      for (const symbol in commoditiesData) {
        tokens.push({
          ...commoditiesData[symbol],
          symbol,
        });
      }
      return tokens;
    }
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
  margin-bottom: 20px;
}
</style>