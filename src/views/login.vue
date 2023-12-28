<template>
  <div class="login">
    <div class="select">
      <div class="title">请选择你的身份</div>
      <div :class="isSelect == 1 ? 'box selected' : 'box'" @click="selectHost(1)">我是主唱 <i class="el-icon-arrow-right"></i>
      </div>
      <div :class="isSelect == 2 ? 'box selected' : 'box'" @click="selectHost(2)">我是伴唱 <i class="el-icon-arrow-right"></i>
      </div>
      <div :class="isSelect == 3 ? 'box selected' : 'box'" @click="selectHost(3)">我是观众 <i class="el-icon-arrow-right"></i>
      </div>
    </div>
    <div class="item">
      appId: <el-select v-model="value" placeholder="请选择一个appId">
        <el-option v-for="item in options" :key="item.label" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div class="item channel">
      channel: <el-input v-model="channel" placeholder="请输入一个频道"></el-input>
    </div>
    <div class="item">
      ntp offset:(ms) <el-input v-model="ntpOffset" placeholder="请输入 ntp offset"></el-input>
    </div>
    <div class="item">
      audio device delay:(ms) <el-input v-model="audioDeviceDelay" placeholder="请输入 audio device delay"></el-input>
    </div>
    <div class="item">
      publish delay:(ms) <el-input v-model="publishDelay" placeholder="publish delay"></el-input>
    </div>
    <div class="item">
      render delay:(ms) （只针对观众端）<el-input :style="{ width: '100px' }" v-model="renderDelay"
        placeholder="publish delay"></el-input>
    </div>
    <div class="item">
      topN:<el-input v-model="topN" placeholder="topN"></el-input>
    </div>
    <div class="item">
      <div>TOPN_SMOOTH_LEVEL:</div>
      <el-input v-model="TOPN_SMOOTH_LEVEL" placeholder="TOPN_SMOOTH_LEVEL"></el-input>
    </div>
    <div class="item">
      TOPN_NEW_SPEAKER_DELAY:<el-input v-model="TOPN_NEW_SPEAKER_DELAY" placeholder="TOPN_NEW_SPEAKER_DELAY"></el-input>
    </div>
    <div class="item">
      TOPN_SWITCH_HOLD_MS:<el-input v-model="TOPN_SWITCH_HOLD_MS" placeholder="TOPN_SWITCH_HOLD_MS"></el-input>
    </div>
    <div class="item">
      <div>
        TOPN_AUDIO_GAIN:
      </div>
      <el-input v-model="TOPN_AUDIO_GAIN" placeholder="TOPN_AUDIO_GAIN"></el-input>
    </div>
    <div class="item">
      <div>
        ENABLE_ENCODED_TRANSFORM: <el-checkbox v-model="ENABLE_ENCODED_TRANSFORM" @change="encodeChange"></el-checkbox>
      </div>
    </div>
    <div class="item">
      <div>
        ENABLE_AUDIO_TOPN: <el-checkbox v-model="ENABLE_AUDIO_TOPN" @change="topNChange"></el-checkbox>
      </div>
    </div>
    <div class="start">
      <el-button @click="onSubmit" style="width: 150px" :disabled="!channel || !isSelect">开始</el-button>
    </div>
  </div>
</template>

<script>
import { APP_INFO } from "../utils/index"



export default {
  data() {
    return {
      channel: "",
      isSelect: "1",
      ntpOffset: 80,
      audioDeviceDelay: -190,
      publishDelay: 110,
      renderDelay: 200,
      topN: 3,
      TOPN_SMOOTH_LEVEL: 1,
      TOPN_NEW_SPEAKER_DELAY: 300,
      TOPN_SWITCH_HOLD_MS: 0,
      TOPN_AUDIO_GAIN: 0,
      ENABLE_ENCODED_TRANSFORM: true,
      ENABLE_AUDIO_TOPN: false,
      options: [
        {
          value: APP_INFO[0].appId,
          label: APP_INFO[0].appId
        },
        {
          value: APP_INFO[1].appId,
          label: APP_INFO[1].appId
        }
      ],
      value: APP_INFO[0].appId
    };
  },
  created() { },
  mounted() { },
  watch: {
    value: {
      handler(newVal) {
        const appInfo = APP_INFO.find(item => item.appId === newVal)
        window.appInfo = appInfo
      },
      immediate: true
    },
    ntpOffset: {
      handler(newVal) {
        window.ntpOffset = Number(newVal)
      },
      immediate: true
    },
    audioDeviceDelay: {
      handler(newVal) {
        window.audioDeviceDelay = Number(newVal)
      },
      immediate: true
    },
    publishDelay: {
      handler(newVal) {
        window.publishDelay = Number(newVal)
      },
      immediate: true
    },
    renderDelay: {
      handler(newVal) {
        window.renderDelay = Number(newVal)
      },
      immediate: true
    },
    topN: {
      handler(newVal) {
        window.topN = Number(newVal)
      },
      immediate: true
    },
    TOPN_SMOOTH_LEVEL: {
      handler(newVal) {
        window.TOPN_SMOOTH_LEVEL = Number(newVal)
      },
      immediate: true
    },
    TOPN_NEW_SPEAKER_DELAY: {
      handler(newVal) {
        window.TOPN_NEW_SPEAKER_DELAY = Number(newVal)
      },
      immediate: true
    },
    TOPN_SWITCH_HOLD_MS: {
      handler(newVal) {
        window.TOPN_SWITCH_HOLD_MS = Number(newVal)
      },
      immediate: true
    },
    TOPN_AUDIO_GAIN: {
      handler(newVal) {
        window.TOPN_AUDIO_GAIN = Number(newVal)
      },
      immediate: true
    },
    ENABLE_ENCODED_TRANSFORM: {
      handler(newVal) {
        window.ENABLE_ENCODED_TRANSFORM = !!newVal
      },
      immediate: true
    },
    ENABLE_AUDIO_TOPN: {
      handler(newVal) {
        window.ENABLE_AUDIO_TOPN = !!newVal
      },
      immediate: true
    }
  },
  methods: {
    selectHost(data) {
      this.isSelect = data;
    },
    onSubmit() {
      window.sessionStorage.setItem("token", "sssss");
      this.$router.push({
        path: "main",
        query: {
          channel: this.channel,
          isSelect: this.isSelect,
        },
      });
    },
    encodeChange(vale) {
      this.ENABLE_ENCODED_TRANSFORM = vale
    },
    topNChange(vale) {
      this.ENABLE_AUDIO_TOPN = vale
    }
  },
};
</script>
<style lang="scss" scoped>
.login {
  width: 375px;
  overflow: auto;
  overflow-x: hidden;
  margin: 0 auto;
  box-shadow: 14px 2px 10px 0px;
  background-image: linear-gradient(#0082fe, #07a9fc, #0ccafe);
  padding: 10px;

  .title {
    color: #fff;
    text-align: left;
  }

  .select {
    .box {
      width: 90%;
      height: 100px;
      background: #fff;
      margin: 10px auto;
      border-radius: 10px;
      text-align: center;
      line-height: 100px;
      cursor: pointer;
      border: 1px solid #fff;
    }

    .selected {
      border: 1px solid #000;
      font-size: 25px;
      color: #0082fe;
    }
  }

  .channel {
    margin-top: 10px !important;
  }

  .item {
    margin-top: 5px;
    text-align: left;
    color: white;

    .el-select {
      width: 80%;
    }

    .el-input {
      width: 50%;
      margin: 0 auto;
    }
  }


  .start {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
