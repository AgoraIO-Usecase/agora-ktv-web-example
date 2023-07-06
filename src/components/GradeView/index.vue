<template>
  <!-- 等级视图组件  -->
  <div class="scoreAssembly">
    <div class="progressHead">
      <span class="songName">{{ name }}-{{ singer }}</span>
      <div class="songScore">
        <span class="gradientText">{{ level }}</span>
        <span class="scoreNum">{{ score }}分</span>
      </div>
    </div>
    <div class="progressBar">
      <div class="progress" :style="{ width: this.progress + '%' }"></div>
      <div class="progressBar__marker"></div>
      <div class="progressBar__line"></div>
      <div class="progressBar__marker">C</div>
      <div class="progressBar__line"></div>
      <div class="progressBar__marker">B</div>
      <div class="progressBar__line"></div>
      <div class="progressBar__marker">A</div>
      <div class="progressBar__line"></div>
      <div class="progressBar__marker">S</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    totalScore: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: "",
    },
    singer: {
      type: String,
      default: "",
    },
  },
  components: {},
  data() {
    return {
      score: 0,
    };
  },
  created() {},
  mounted() {},
  computed: {
    progress() {
      if (this.score <= 5 || !this.totalScore) {
        return 5;
      }
      // % 百分比
      const curProgress = (this.score / this.totalScore) * 100;
      return Math.min(curProgress, 100);
    },
    level() {
      if (this.progress > 20 && this.progress <= 40) {
        return "C";
      } else if (this.progress > 40 && this.progress <= 60) {
        return "B";
      } else if (this.progress > 60 && this.progress <= 80) {
        return "A";
      } else if (this.progress > 80 && this.progress <= 100) {
        return "S";
      }
      return "C";
    },
  },
  methods: {
    updateScore(score) {
      this.score += score;
    },
    setScore(score) {
      this.score = score;
    },
  },
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.scoreAssembly {
  padding: 0 20px;

  .progressHead {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .songName {
    color: #ffffff60;
  }

  .songScore {
    color: #ffffff;
  }

  .progress {
    position: absolute;
    height: 100%;
    width: 50%;
    border-radius: 16px;
    background: linear-gradient(to right, #94f0ff, #368cff);
  }

  .progressBar {
    position: relative;
    height: 16px;
    background-color: #f7f7f712;
    border-radius: 16px;
    display: flex;
    margin-top: 12px;
  }

  .progressBar__marker {
    height: 100%;
    width: 100%;
    margin-left: 4px;
    color: #ffffff45;
  }

  .progressBar__line {
    height: 100%;
    width: 8px;
    background-color: #ffffff45;
  }

  .gradientText {
    background: linear-gradient(to right, #91ecff, #d096ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 24px;
    font-weight: bold;
    font-family: sans-serif;
    text-align: center;
  }

  .scoreNum {
    margin-left: 4px;
  }
}
</style>
