<template>
  <section class="voice-set">
    <div><i class="el-icon-minus" @click="decrease"></i></div>
    <div class="line"><el-progress :percentage="volume" :color="customColors"></el-progress></div>
    <div><i class="el-icon-plus" @click="increase"></i></div>
  </section>
</template>

<script>
export default {
  props: {
    volume: {
      type: Number,
      default: 50,
    },
  },
  components: {},
  data() {
    return {
      customColors: [
        { color: "#f56c6c", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#5cb87a", percentage: 60 },
        { color: "#1989fa", percentage: 80 },
        { color: "#6f7ad3", percentage: 100 },
      ],
    };
  },
  created() { },
  mounted() { },
  methods: {
    decrease() {
      const newVolume = this.volume - 10 >= 0 ? this.volume - 10 : 0
      this.$emit("updateVolume", newVolume)
    },
    increase() {
      const newVolume = this.volume + 10 <= 100 ? this.volume + 10 : 100
      this.$emit("updateVolume", newVolume)
    },
  },
};
</script>
<style lang="scss">
.voice-set {
  color: #fff;
  height: 40px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;

  i {
    cursor: pointer;
    width: 10%;
    font-weight: 700 !important;
  }

  .line {
    width: 80%;
  }
}
</style>
