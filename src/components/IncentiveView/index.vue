<!-- 激励视图组件 -->
<template>
  <div :class="[{ encourage: true, play: anPlay, restart: palyt }]">
    <div class="encourageInner">
      <img class="encourageIcon" :src="iconSrc" />
      <div class="encourageNum">{{ socreStr }}</div>
    </div>
  </div>
</template>

<script>
import fair from "../../../assets/fairx2.png";
import good from "../../../assets/goodx2.png";
import excellent from "../../../assets/excellentx2.png";
export default {
  components: {},
  data() {
    return {
      iconSrc: "",
      socreStr: "",
      anPlay: false,
      palyt: false,
    };
  },
  created() {},
  mounted() {},
  methods: {
    show(combo) {
      if (combo) {
        let src = "";
        switch (combo.type) {
          case "fair":
            src = fair;
            break;
          case "good":
            src = good;
            break;
          case "excellent":
            src = excellent;
            break;
          default:
            src = fair;
            break;
        }
        this.iconSrc = src;
        const num = combo.num;
        if (num > 0) {
          this.socreStr = num == 1 ? "" : "x" + num;
          if (this.anPlay) {
            this.anPlay = false;
            this.palyt = true;
          } else {
            this.anPlay = true;
            this.palyt = false;
          }
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.encourage {
  opacity: 0;
  position: absolute;
  width: 100%;
  top: 60px;
  left: 0;

  .encourageInner {
    display: flex;
    width: 100%;
    align-items: center;
    flex-direction: column;
  }

  .encourageIcon {
    width: 100px;
  }

  .encourageNum {
    background: linear-gradient(to right, #91ecff, #d096ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 16px;
    font-weight: bold;
    font-family: sans-serif;
    text-align: center;
  }
}

.play {
  animation: amOne 2s 1 ease;
}

.restart {
  animation: amOTwo 2s 1 ease;
}

@keyframes amOne {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }

  20% {
    opacity: 1;
    transform: scale(1);
  }

  90% {
    opacity: 1;
    transform: scale(1.15);
  }

  10% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes amOTwo {
  0% {
    opacity: 0;
    transform: scale(1);
  }

  20% {
    opacity: 0;
    transform: scale(1);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }

  90% {
    opacity: 1;
    transform: scale(1.15);
  }

  10% {
    opacity: 0;
    transform: scale(1);
  }
}
</style>
