<template>
  <section class="test-view">
    <button v-if="!showInfo" class="debug-btn" @click="showInfo = true">Debugger</button>
    <section class="test-wrapper" v-if="showInfo">
      <span class="debug-close" @click="showInfo = false">X</span>
      <div>
        <button class="" @click="skipPrelude">跳过前奏</button>
      </div>
      <div>word: {{ data.word }}</div>
      <div>stdPitch: {{ data.stdPitch }}</div>
      <div>voicePitch: {{ data.voicePitch }}</div>
      <div>originalPitch: {{ data.originalPitch }}</div>
      <div>cursorY: {{ data.cursorY }}</div>
      <div>progress: {{ data.currentTime }}</div>
      <div>score-list:</div>
      <div class="score-list">
        <span v-for="(item, index) in data.scoreList" :key="index">
          <span>{{ index + 1 }} </span>
          <span>score:{{ item.score }} </span>
          <span v-if="item.combo"> {{ item.combo.type }} {{ item.combo.num }}</span>
        </span>
      </div>
    </section>
  </section>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => { },
    },
  },
  components: {},
  data() {
    return {
      showInfo: false
    };
  },
  created() { },
  mounted() { },
  methods: {
    skipPrelude() {
      this.$emit("skipPrelude")
    }
  },
};
</script>
<style lang="scss">
.test-view {
  position: fixed;
  left: 10px;
  top: 10px;
  z-index: 99999;
}

.test-wrapper {
  width: 260px;
  z-index: 999;
  background: #232d61;
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  font-size: 14px;

  .debug-close {
    position: absolute;
    right: 8px;
    top: 8px;
    cursor: pointer;
  }

  .score-list {
    display: flex;
    flex-direction: column;
    align-items: left;
  }

  div {
    padding: 2px 0px;
    text-align: left;
  }
}
</style>
