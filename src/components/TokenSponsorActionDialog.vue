<template>
  <v-dialog
    transition="dialog-top-transition"
    v-model="isVisible"
    max-width="400"
    scrolllable
    hide-overlay
    persistent
  >
    <template v-slot:default="dialog">
      <v-card>
        <v-toolbar
          color="#1976d2"
          dark
          flat
        >
          {{ title }}
        </v-toolbar>

        <div v-if="loading" class="loading-komodo-container">
          <template v-if="usdcApproveWaiting">
            <div class="waiting-label">
              Waiting for USDC spending approval...
            </div>
            <img src="https://media.giphy.com/media/SVzzgZxzjHGla/giphy.gif"/>
          </template>
          <template v-else>
            <div class="waiting-label">
              Waiting for tx confirmation...
            </div>
            <img src="https://media.giphy.com/media/KZeDdQ4auOZEajNALF/giphy.gif"/>
          </template>
        </div>

        <div v-if="additionalNote && !loading" class="additional-note-container">
          <v-icon class="info-icon" small color="blue">mdi-information-outline</v-icon>
          <div class="text">
            {{ additionalNote }}
          </div>
        </div>

        <div class="input-container">
          <v-text-field
            :label="inputLabel"
            required
            v-model="value"
            type="number"
          ></v-text-field>
        </div>

        <v-card-actions v-if="!loading" class="justify-end">
          <v-btn
            text
            color="#1976d2"
            @click="isVisible = false"
          >
            Close
          </v-btn>

          <v-btn
            outlined
            :loading="loading"
            color="#1976d2"
            @click="onConfirmButtonClick(value)"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import blockchain from "@/helpers/blockchain";
import formatter from "@/helpers/formatter";

const { DEFAULT_SOLVENCY, MIN_SOLVENCY } = blockchain;

export default {
  name: 'TokenSponsorActionDialog',

  props: {
    currentPrice: Object,
    ethPrice: Object,
    balance: Number,
    symbol: String,
    ethBalance: Number,
    usdcBalance: Number,
    collateral: Number,
    usdcApproveWaiting: Boolean,
  },

  data() {
    return {
      isVisible: false,
      title: '',
      loading: false,
      inputLabel: '',
      additionalNoteType: '',
      value: null,
      onConfirmButtonClick: null,
    };
  },

  methods: {
    openDialog(opts) {
      this.title = opts.title;
      this.inputLabel = opts.inputLabel;
      this.isVisible = true;
      this.onConfirmButtonClick = opts.onConfirmButtonClick;
      this.additionalNoteType = opts.additionalNoteType;

      if (opts.initialValue) {
        this.value = opts.initialValue;
      }
    },

    setLoading(value) {
      this.loading = value;
    },

    close() {
      this.isVisible = false;
    },
  },

  computed: {
    additionalNote() {
      switch (this.additionalNoteType) {
        case 'mint':
          return this.additionalNoteForMint;
        case 'burn':
          return this.additionalNoteForBurn;
        case 'add-collateral':
          return this.additionalNoteForAddCollateral;
        case 'remove-collateral':
          return this.additionalNoteForRemoveCollateral;
        default:
          return '';
      }
    },

    additionalNoteForMint() {
      const stake = blockchain.calculateStakeAmount({
        tokenAmount: this.value,
        tokenPrice: this.currentPrice.value,
        solvency: DEFAULT_SOLVENCY,
      });
      const stakeFormatted = formatter.formatPriceBN(stake);
      const usdcBalanceFormatted = formatter.formatPriceBN(this.usdcBalance)
      return `You should stake ${stakeFormatted} USDC to mint `
        + `${this.value} ${this.symbol} and maintain ${DEFAULT_SOLVENCY}% solvency.`
        + `You have: ${usdcBalanceFormatted} USDC`;
    },

    additionalNoteForBurn() {
      return `Max: ${this.balance} ${this.symbol}`;
    },

    additionalNoteForAddCollateral() {
      const usdcBalanceFormatted = formatter.formatPriceBN(this.usdcBalance);
      return `Max: ${usdcBalanceFormatted} USDC`;
    },

    additionalNoteForRemoveCollateral() {
      const minCollateral = (MIN_SOLVENCY / 100) * this.balance * this.currentPrice.value;
      const maxAmountToRemove = Math.max(this.collateral - minCollateral, 0);
      const maxToRemoveFormatted = formatter.formatPriceBN(maxAmountToRemove);
      return `You can remove MAX: ${maxToRemoveFormatted} USDC to `
        + `remain solvent with ${MIN_SOLVENCY}% solvency`;
    },
  },
}
</script>

<style lang="scss" scoped>

.input-container {
  padding: 16px;
}

.loading-komodo-container {
  .waiting-label {
    font-weight: bold;
    font-size: 20px;
    text-align: center;
    margin-bottom: 16px;
  }

  padding: 16px;
  padding-bottom: 0px;

  img {
    width: 100%;
    border-radius: 10px;
    // margin: 5px;
  }
}

.additional-note-container {
  font-size: 14px;
  color: gray;
  padding: 4px 16px;
  margin-top: 20px;
  display: grid;
  grid-template-columns: 24px auto;

  .info-icon {
    display: block;
    position: relative;
    top: 2px;
  }
}

</style>
