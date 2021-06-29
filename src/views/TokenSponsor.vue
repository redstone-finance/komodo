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

      <div class="solvency-container">
        <div class="gauge-container">
          <VueGauge
            refid="gauge"
            :key="gaugeOptions.needleValue" 
            :options="gaugeOptions"
          />
        </div>
        <div class="text-center mb-6">
          <span class="subtitle">
            Solvency:
          </span>
          <span class="value">
            {{ solvency }}%
          </span>
        </div>
      </div>

      <hr />

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
                {{ balance || '...' }} {{ symbol }}
              </div>
              <hr />
              <div class="usd-value">
                {{ balanceValueUSD | price }}
              </div>
            </div>
          </div>

          <div class="buttons">
            <div class="button-container">
              <v-btn color="#0F9D58" @click="mintButtonClicked()" rounded outlined large>
                Mint tokens
                <v-icon right>
                  mdi-wallet-plus
                </v-icon>
              </v-btn>
            </div>

            <div class="button-container">
              <v-btn color="#DB4437" @click="burnButtonClicked()" rounded outlined large>
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
                <template v-if="!loadingCollateral">
                  {{ collateral }} ETH
                </template>
                <template v-else>
                  ...
                </template>
              </div>
              <hr />
              <div class="usd-value">
                {{ collateralValueUSD | price }}
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
import VueGauge from 'vue-gauge';
import blockchain from "@/helpers/blockchain";
import commoditiesData from "@/assets/data/commodities.json";
import TokenSponsorActionDialog from "@/components/TokenSponsorActionDialog";

export default {
  name: 'TokenSponsor',

  data() {
    return {
      currentPrice: null,
      ethPrice: null,
      balance: null,
      tab: 0,
      solvency: 0,
      collateral: 0,
      loadingCollateral: false,
    };
  },

  created() {
    this.loadCurrentPrice();
    this.loadSolvency();
    this.loadCollateral();
    this.loadBalance();
    this.loadEthPrice();
  },

  methods: {
    async loadCurrentPrice() {
      this.currentPrice = await redstone.getPrice(this.symbol, {
        provider: "redstone-stocks",
      });
    },

    async loadBalance() {
      this.balance = await blockchain.getBalance(this.symbol);
    },

    async loadEthPrice() {
      this.ethPrice = await redstone.getPrice("ETH");
    },

    async loadSolvency() {
      this.solvency = await blockchain.getSolvency(this.symbol);
    },

    async loadCollateral() {
      this.loadingCollateral = true;
      this.collateral = await blockchain.getCollateralAmount(this.symbol);
      this.loadingCollateral = false;
    },

    mintButtonClicked() {
      this.opendDialog({
        title: `Mint ${this.symbol} tokens`,
        inputLabel: `Amount in ${this.symbol}`,
        onConfirmButtonClick: (value) => this.mint(value),
      });
    },

    burnButtonClicked() {
      this.opendDialog({
        title: `Burn ${this.symbol} tokens`,
        inputLabel: `Amount in ${this.symbol}`,
        onConfirmButtonClick: (value) => this.burn(value),
      });
    },

    addCollateralButtonClicked() {
      this.opendDialog({
        title: `Add ETH tokens to your collateral`,
        inputLabel: `Amount in ETH`,
        onConfirmButtonClick: (value) => this.addCollateral(value),
      });
    },

    removeCollateralButtonClicked() {
      this.opendDialog({
        title: `Remove ETH tokens from your collateral`,
        inputLabel: `Amount in ETH`,
        onConfirmButtonClick: (value) => this.removeCollateral(value),
      });
    },

    async mint(value) {
      await this.sendBlockchainTransaction(
        async () => await blockchain.mint(this.symbol, value));
    },

    async burn(value) {
      await this.sendBlockchainTransaction(
        async () => await blockchain.burn(this.symbol, value));
    },

    async addCollateral(value) {
      await this.sendBlockchainTransaction(
        async () => await blockchain.addCollateral(this.symbol, value));
    },

    async removeCollateral(value) {
      await this.sendBlockchainTransaction(
        async () => await blockchain.removeCollateral(this.symbol, value));
    },

    async sendBlockchainTransaction(txSendFunction, successMsg, errorMsg) {
      try {
        this.setDialogLoading(true);
        this.$toast.info("Please confirm transaction in metamask");
        await txSendFunction();
        this.$toast.success(successMsg || "Transaction sent successfully");
      } catch (e) {
        this.$toast.error(errorMsg || "Error occured");
        console.error(e);
      } finally {
        this.setDialogLoading(false);
        this.closeDialog();
      }
    },

    opendDialog(opts) {
      this.$refs.dialog.openDialog(opts);
    },

    setDialogLoading(value) {
      this.$refs.dialog.setLoading(value);
    },

    closeDialog() {
      this.$refs.dialog.close();
    },
  },

  computed: {
    symbol() {
      return this.$route.params.symbol;
    },

    collateralValueUSD() {
      if (this.ethPrice) {
        return this.ethPrice.value * this.collateral;
      } else {
        return '...';
      }
    },

    balanceValueUSD() {
      if (this.currentPrice) {
        return this.currentPrice.value * this.balance;
      } else {
        return '...';
      }
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

    // 0 needleValue means 100% solvency, 100 needleValue means 120% and more
    needleValue() {
      return (this.solvency - 100) * (100 / 20);
    },

    gaugeOptions() {
      return {
        // arcLabels: ['Low', 'Neutral', 'High'],
        arcDelimiters: [25, 50, 75],
        needleValue: this.needleValue,
        needleColor: '#999',
        // centralLabel: "Solvency",
        chartWidth: 180,
        arcColors: ['#DB4437', '#F4B400', '#4285F4', '#0F9D58'],
        rangeLabel: ['Low', 'High']
      };
    },
  },

  components: {
    TokenSponsorActionDialog,
    VueGauge,
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
    border-bottom: 1px solid #eee;
    
  }

  .solvency-container {
    .subtitle {
      color: #777;
    }
    .value {
      font-weight: bold;
    }

    .gauge-container {
      // border: 1px solid black;
      display: flex;
      justify-content: center;
    }
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
