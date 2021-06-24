<template>
  <div class="cards-container">
    <v-container>
      <v-row>
        <v-col v-for="commodity in commodities" :key="commodity.symbol" md="4">
          <v-card class="pa-2 increase-on-hover" outlined>
            <v-card-title>
              <v-avatar>
                <img alt="commodity-logo" :src="commodity.logoURI" />
              </v-avatar>
              <p class="ml-6 pt-4">
                {{ commodity.symbol }}
                <br />
                <span class="commodity-name">
                  {{ commodity.name }}
                </span>
              </p>
            </v-card-title>

            <v-card-text>
              <div class="metrics">
                <div class="usd-price metric">
                  <div class="value">
                    $1.23
                  </div>
                  <div class="label">
                    USD Price
                  </div>
                </div>

                <div class="liquidity metric">
                  <div class="value">
                    $12.123,00
                  </div>
                  <div class="label">
                    Liquidity
                  </div>
                </div>
              </div>
            </v-card-text>
            
            <!-- <v-img :src=""></v-img> -->

            
            <!-- {{ commodity }} -->
          </v-card>
          <div class="card" >
            
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>

export default {
  name: 'CommoditiesCards',
  props: {
    commodities: Array,
  },

}
</script>

<style scoped lang="scss">

/* .card {
  border: 1px solid black;
  margin: 10px;
} */

.commodity-name {
  font-size: 12px;
  color: #555;
}

.increase-on-hover {
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
}

.metrics {
    display: flex;
    // justify-content: space-between;
  }

.metric {
  margin-right: 40px;

  .value {
    color: #111;
    font-size: 16px;
    font-weight: 500;
  }

  .label {
    font-size: 12px;
    color: #777;
    font-weight: 400;
  }
}

</style>