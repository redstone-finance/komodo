<template>
  <v-dialog
    transition="dialog-top-transition"
    v-model="isVisible"
    max-width="600"
  >
    <template v-slot:default="dialog">
      <v-card>
        <v-toolbar
          color="#1976d2"
          dark
          flat
        >{{ title }}</v-toolbar>
        <!-- <v-card-text>
          <div class="text-h2 pa-12">Hello world!</div>
        </v-card-text> -->


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
export default {
  name: 'TokenSponsorActionDialog',

  data() {
    return {
      isVisible: false,
      title: '',
      inputLabel: '',
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
    },
  },
}
</script>

<style scoped>

.input-container {
  padding: 16px;
}

</style>
