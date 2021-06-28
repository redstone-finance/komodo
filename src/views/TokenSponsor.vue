<template>
  <div class="token-sponsor">
    <h1 class="text-center">Mint or burn: {{ symbol }}</h1>
  </div>
</template>

<script>
export default {
  name: 'TokenSponsor',

  computed: {
    symbol() {
      return this.$route.params.symbol;
    },
  }
}
</script>

<style scoped lang="scss">

</style>
