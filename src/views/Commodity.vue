<template>
  <div class="commodities">
    <h1 class="text-center">Commodity: {{ $route.params.symbol }}</h1>
  </div>
</template>

<script>
// import commoditiesData from "@/assets/data/commodities.json"

export default {
  name: 'Commodity',

  computed: {
  },

  components: {
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