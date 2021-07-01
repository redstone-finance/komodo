<template>
  <v-dialog
    transition="dialog-top-transition"
    v-model="isVisible"
    max-width="400"
  >
    <template v-slot:default="dialog">
      <v-card>
        <v-toolbar
          color="#1976d2"
          dark
          flat
        >{{ title }}</v-toolbar>

        <div v-if="additionalNote" class="additional-note-container">
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

        <v-card-actions class="justify-end">
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
            @click="onConfirmButtonClick(value, stakeValue)"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>

const DEFAULT_SOLVENCY = 150; // 150%
const MIN_SOLVENCY = 121; // 121%

export default {
  name: 'TokenSponsorActionDialog',

  props: {
    currentPrice: Object,
    ethPrice: Object,
    balance: Number,
    symbol: String,
    ethBalance: Number,
    collateral: Number,
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
      stakeValue: 0,
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
      const currentTokenEthPrice =
        this.currentPrice.value / this.ethPrice.value;
      const ethNeeded =
        (DEFAULT_SOLVENCY / 100) * this.value * currentTokenEthPrice;
      this.stakeValue = Number(ethNeeded.toFixed(5));
      return `You should stake ${this.stakeValue} ETH to mint `
        + `${this.value} ${this.symbol} and maintain ${DEFAULT_SOLVENCY}% solvency`;
    },

    additionalNoteForBurn() {
      return `Max: ${this.balance} ${this.symbol}`;
    },

    additionalNoteForAddCollateral() {
      return `Max: ${this.ethBalance.toFixed(5)} ETH`;
    },

    additionalNoteForRemoveCollateral() {
      const currentTokenEthPrice =
        this.currentPrice.value / this.ethPrice.value;
      const minCollateral = (MIN_SOLVENCY / 100) * this.balance * currentTokenEthPrice;
      const maxAmountToRemove = (Math.max(this.collateral - minCollateral, 0)).toFixed(5);
      return `You can remove MAX: ${maxAmountToRemove} ${this.symbol} to `
        + `remain solvent with ${MIN_SOLVENCY}% solvency`;
    },
  },
}
</script>

<style lang="scss" scoped>

.input-container {
  padding: 16px;
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
