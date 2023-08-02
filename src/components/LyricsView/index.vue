<!--  歌词显示组件 将main中的scorll歌词组件抽离到这个里面 -->
<template>
  <div class="lyric">
    <div class="scroll-wrapper" v-if="lyric.lines">
      <div class="scroll-box" id="scroll-box" :style="{ transform: 'translate3d(0,' + translateY + 'px' + ',0)' }">
        <div
          v-for="(item, i) in lyric.lines"
          :key="i + 's'"
          class="sentence"
          :class="i == currentLine + 1 && currentLine >= 1 ? 'big' : 'normal'"
        >
          <div
            v-for="(tone, j) in item.tones"
            :key="j + 's'"
            class="word"
            :class="tone.beginTime <= currentTime? 'light' : 'white'"
          >
            {{ tone.word }}
          </div>
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    lyric: {
      type: Object,
      default: () => {},
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    currentLine: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      translateY: 0,
    };
  },
  watch: {
    currentLine(line) {
      this.translateY = -line * 32;
    },
  },
  methods: {
    lineChange() {},
  },
};
</script>
<style lang="scss" scoped>
.lyric {
  width: 100%;
  height: 170px;
  position: relative;

  .musicName {
    color: #ffffff;
    line-height: 22px;
    display: inline-block;
    padding: 5px 10px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    text-align: center;
    margin: 5px 20px;
  }

  .scroll-wrapper {
    text-align: center;
    height: 130px;
    overflow: hidden;
    color: #fff;

    .scroll-box {
      transition: all 0.3s;
      will-change: transform;
    }

    .sentence {
      height: 22px;
      line-height: 22px;
      margin: 10px 0;

      .word {
        display: inline-block;
      }
    }
  }
}

.white {
  color: #ffffff;
}

.light {
  color: #fce25f;
}

.big {
  font-size: 20px;
}

.normal {
  font-size: 16px;
}
</style>
