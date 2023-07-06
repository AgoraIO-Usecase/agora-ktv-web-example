<!-- 每句得分组件 -->
<template>
  <div class="lineTable">
    <canvas ref="lineCanvas" class="lineCanvas"></canvas>
    <canvas ref="particleCanvas" class="particleCanvas"></canvas>
    <img src="../../../assets/cy.png" class="cy" />
    <img src="../../../assets/curso.png" class="curso" :style="{ top: 55 - cursorVal + 'px' }" />
    <div class="lineScore" :style="{ top: scoreTop + 'px', display: showScore ? 'block' : 'none' }">{{ "+" + this.score }}</div>
  </div>
</template>

<script>
import Particle from "./particle";
import Spectrum from "./spectrum";
export default {
  components: {},
  data() {
    return {
      lineObj: null,
      particleObj: null,
      cursorVal: 0,
      particles: [],
      scoreTop: 54,
      scoreTm: null,
      showScore: false,
      score: 0,
    };
  },
  created() {},
  mounted() {
    this.canvasInit(); //初始画布
    this.initLine(); //画上线谱
    this.startAnim(); //开始动画
  },
  methods: {
    canvasInit() {
      this.lineObj = this.$refs.lineCanvas;
      this.particleObj = this.$refs.particleCanvas;
      this.lineObj.height = 60;
      this.lineObj.width = 375;
      this.particleObj.height = 60;
    },
    //初始化也可清零
    initLine() {
      const ctx = this.lineObj.getContext("2d");
      ctx.clearRect(0, 0, this.lineObj.width, this.lineObj.height);
      ctx.beginPath();
      ctx.strokeStyle = "#ffffff80";
      ctx.lineWidth = 1;
      const interval = this.lineObj.height / 5;
      for (let i = 0; i < 6; i++) {
        let startY = i * interval;
        ctx.moveTo(0, startY);
        ctx.lineTo(this.lineObj.width, startY);
      }
      ctx.stroke();
    },
    drawCursor(cursorY) {
      const particleCtx = this.particleObj.getContext("2d");
      particleCtx.clearRect(0, 0, this.particleObj.width, this.particleObj.height);
      this.cursorVal = cursorY;

      // particleCtx.beginPath();
      // particleCtx.moveTo(this.particleObj.width - 20, this.particleObj.height - cursorY - 8);
      // particleCtx.lineTo(this.particleObj.width, this.particleObj.height - cursorY);
      // particleCtx.lineTo(this.particleObj.width - 20, this.particleObj.height - cursorY + 8);
      // particleCtx.closePath();
      // particleCtx.fillStyle = "white";
      // particleCtx.fill();

      // if (flg) {

      // } else {
      //   this.cursorVal =  cursorY;
      // }

      if (this.cursorVal < 5) {
        this.particles = [];
      }
    },
    draw({ filterReactInfo = [], filterColoringReactInfo = [] } = {}) {
      // 清空画布
      this.clearReact();
      //1、加载歌词
      const interval = this.lineObj.height / 5;
      const spectrumsArry = filterReactInfo.map((item) => {
        return new Spectrum(item.x, item.y, item.width, 4, interval, "#d8d8d8", this.lineObj);
      });
      spectrumsArry.forEach((spectrum) => {
        spectrum.draw();
      });
      //2、加载着色歌词
      const colorSpectrumsArry = filterColoringReactInfo.map((item) => {
        return new Spectrum(item.x, item.y, item.width, 4, interval, "#FF8AB4", this.lineObj);
      });
      colorSpectrumsArry.forEach((spectrum) => {
        spectrum.draw();
      });
      this.drawCursor(this.cursorVal);
    },
    // 清理React块
    clearReact() {
      const ctx = this.lineObj.getContext("2d");
      ctx.clearRect(0, 0, this.lineObj.width, this.lineObj.height);
      this.initLine();
    },
    //清空线谱
    clear() {
      const ctx = this.lineObj.getContext("2d");
      ctx.clearRect(0, 0, this.lineObj.width, this.lineObj.height);
      this.initLine();
      const paCtx = this.particleObj.getContext("2d");
      paCtx.clearRect(0, 0, this.particleObj.width, this.particleObj.height);
    },
    clearParticle() {
      const paCtx = this.particleObj.getContext("2d");
      paCtx.clearRect(0, 0, this.particleObj.width, this.particleObj.height);
      this.particles = [];
    },
    showCursorTailAnim() {
      const particleAngleRange = 15;
      for (let i = 0; i < 4; i++) {
        const size = 10; //Math.random() * 5 + 10; // 粒子大小在10到15之间
        const speed = 6; // 粒子速度在1到4之间
        const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        const angle = Math.floor(Math.random() * (particleAngleRange * 2 + 1)) - particleAngleRange;
        const verticalAngle = Math.floor(Math.random() * (particleAngleRange * 2 + 1)) - particleAngleRange;
        let shape = 4;
        if (i % 2 == 0) {
          shape = 5;
        }
        const particle = new Particle(
          this.particleObj.width - 20,
          this.particleObj.height - this.cursorVal,
          size,
          color,
          angle,
          verticalAngle,
          speed,
          shape,
          this.particleObj
        );
        if (this.particles.length <= 40) {
          this.particles.push(particle);
        } else {
          for (let i = this.particles.length - 1; i >= 0; i--) {
            //随机淘汰策略
            if (Math.random() > 0.5) {
              this.particles.splice(i, 1);
            }
          }
        }
        //越界粒子淘汰
        for (let i = this.particles.length - 1; i >= 0; i--) {
          let particle = this.particles[i];
          if (particle.x < 10 || particle.y < 10 || particle.y > this.particleObj.height) {
            this.particles.splice(i, 1);
          }
        }
      }
    },
    clearCursorTailAnim() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        let particle = this.particles[i];
        if (particle.x > this.particleObj.width - 30) {
          this.particles.splice(i, 1);
        }
      }
    },
    scoreAnim(score) {
      if (score > 0) {
        this.score = score;
        clearInterval(this.scoreTm);
        this.showScore = true;
        this.scoreTm = setInterval(() => {
          this.scoreTop = this.scoreTop - 0.15;
          if (this.scoreTop <= 0) {
            clearInterval(this.scoreTm);
            this.scoreTop = 54;
            this.showScore = false;
          }
        }, 2);
      }
    },
    startAnim() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        let particle = this.particles[i];
        particle.update();
        particle.draw();
        // 删除粒子
        if (particle.x < 0 || particle.y < 0 || particle.x > this.particleObj.width || particle.y > this.particleObj.height) {
          this.particles.splice(i, 1);
        }
      }
      requestAnimationFrame(this.startAnim);
    },
  },
};
</script>
<style lang="scss" scoped>
.lineTable {
  position: relative;
  height: 60px;
  width: 375px;
}

.lineCanvas {
  width: 375px;
  height: 60px;
}

.particleCanvas {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100px;
  // border-right: #fff solid 2px;
  background: linear-gradient(to left, #5480c37a, #94f0ff00);
}

.curso {
  height: 10px;
  position: absolute;
  left: 92px;
  top: 54px;
}
.cy {
  position: absolute;
  top: 0px;
  height: 60px;
  left: 100px;
}
.lineScore {
  position: absolute;
  left: 104px;
  color: #fff;
  font-size: 12px;
}
.btnTest {
  position: absolute;
  left: 10px;
  top: 30px;
}
</style>
