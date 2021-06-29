<template>
  <div class="token-sponsor">
    <h1 class="text-center">
      {{ symbol }}:
      <span class="price-value">
        {{ priceValue | price }}
      </span>
    </h1>
    <div class="subtitle text-center">
      {{ tokenDetails.name }}
    </div>

    <TokenSponsorActionDialog  ref="dialog" />

    <div class="main-card">
      <v-tabs class="mb-4" fixed-tabs centered v-model="tab">
        <v-tab>
          Balance
          <v-icon right>
            mdi-wallet
          </v-icon>
        </v-tab>
        <v-tab>
          Collateral
          <v-icon right>
            mdi-cash-lock
          </v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <!-- Balance -->
        <v-tab-item>
          <div class="balance-title">
            <div>
              Your balance:
            </div>
            <div class="value">
              <div class="main-currency-value">
                345.12 {{ symbol }}
              </div>
              <hr />
              <div class="usd-value">
                $123.12
              </div>
            </div>
          </div>

          <div class="buttons">
            <div class="button-container">
              <v-btn color="green" @click="mintButtonClicked()" rounded outlined large>
                Mint tokens
                <v-icon right>
                  mdi-wallet-plus
                </v-icon>
              </v-btn>
            </div>

            <div class="button-container">
              <v-btn color="pink" @click="burnButtonClicked()" rounded outlined large>
                Burn tokens
                <v-icon right>
                  mdi-fire
                </v-icon>
              </v-btn>
            </div>
          </div>

        </v-tab-item>

        <!-- Collateral -->
        <v-tab-item>
                    <div class="balance-title">
            <div>
              Your collateral:
            </div>
            <div class="value">
              <div class="main-currency-value">
                3.12 ETH
              </div>
              <hr />
              <div class="usd-value">
                $123.12
              </div>
            </div>
          </div>

          <div class="buttons">
            <div class="button-container">
              <v-btn color="#1976d2" @click="addCollateralButtonClicked()" rounded outlined large>
                Add collateral
                <v-icon right>
                  mdi-lock-plus
                </v-icon>
              </v-btn>
            </div>

            <div class="button-container">
              <v-btn color="orange" @click="removeCollateralButtonClicked()" rounded outlined large>
                Remove collateral
                <v-icon right>
                  mdi-delete
                </v-icon>
              </v-btn>
            </div>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </div>
</template>

<script>
import redstone from "redstone-api";
import commoditiesData from "@/assets/data/commodities.json";
import TokenSponsorActionDialog from "@/components/TokenSponsorActionDialog";

export default {
  name: 'TokenSponsor',

  data() {
    return {
      currentPrice: null,
      tab: 0,
    };
  },

  async created() {
    this.currentPrice = await redstone.getPrice(this.symbol, {
      provider: "redstone-stocks",
    });
  },

  methods: {
    mintButtonClicked() {
      // alert("mintButtonClicked");
      this.opendDialog({
        title: `Mint ${this.symbol} tokens`,
        inputLabel: `Amount in ${this.symbol}`,
        onConfirmButtonClick: (value) => this.mint(value),
      });
      // TODO: open modal to get value to mint
    },

    mint(value) {
      alert(`Will mint ${value} tokens`);
    },

    burnButtonClicked() {
      alert("burnButtonClicked");
    },

    opendDialog(opts) {
      this.$refs.dialog.openDialog(opts);
    },
  },

  computed: {
    symbol() {
      return this.$route.params.symbol;
    },

    tokenDetails() {
      const details = commoditiesData[this.symbol];
      return {
        ...details,
        symbol: this.symbol,
      };
    },

    priceValue() {
      if (this.currentPrice) {
        return this.currentPrice.value;
      } else {
        return 0;
      }
    },
  },

  components: {
    TokenSponsorActionDialog,
  },
}
</script>

<style scoped lang="scss">

h1 {
  // font-size: 20px;
  font-weight: 700;
  font-size: 30px;
  margin-top: 14px;
  color: #333;
}

.price-value {
  color: #0F9D58;
}

.subtitle {
  color: #777;
}

.main-card {
  margin: auto;
  margin-top: 20px;
  padding: 16px;
  border-radius: 5px;
  box-shadow: 0 0 1px gray;
  width: 600px;
  // height: 500px;

  hr {
    border: none;
    border-bottom: 1px solid #ddd;
  }

  .balance-title {
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    margin-bottom: 30px;
    color: #777;
    // border: 1px solid black;

    div {
      margin-left: 10px;
      margin-right: 10px;
    }

    .value {
      // border: 1px solid red;
      text-align: center;

      .main-currency-value {
        font-size: 24px;
        font-weight: bold;
        color: #1976d2;
      }

      .usd-value {
        font-size: 14px;
        color: gray;
      }
    }
  }

  .buttons {
    margin-top: 40px;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;

    .button-container {
      // border: 1px solid red;
      margin-right: 5px;
      margin-left: 5px;
    }
  }
}

</style>
