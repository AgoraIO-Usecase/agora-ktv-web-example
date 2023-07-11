<template>
  <div class="main" v-loading="loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="chanleNane">
      <p>房间号: {{ channel }} 角色: {{ roleString }}</p>
      <img class="backout" src="../../img/backout.png" alt="" @click="backout" />
    </div>
    <div class="lyric-wrapper">
      <GradeView :name="lyric.name" :singer="lyric.singer" :totalScore="totalScore" ref="gradeViewRef"></GradeView>
      <div class="line-score-wrapper">
        <LineScoreView ref="lineScoreViewRef"></LineScoreView>
      </div>
      <IncentiveView ref="incentiveViewRef"></IncentiveView>
      <LyricsView :lyric="lyric" :currentTime="currentTime" :currentLine="currentLine">
        <section class="buttonList" v-if="role == 'host'">
          <div>
            <img class="img" :src="toggleImgSrc" alt="" @click="togglePlay" />
          </div>
          <button class="chorus" @click="endChorus">{{ "结束合唱" }}</button>
        </section>
      </LyricsView>
    </div>
    <VoiceSet :volume="volume" @updateVolume="updateVolume"></VoiceSet>
    <section class="bottom" v-if="role == 'host'">
      <div>
        <img src="../../img/btn.png" class="order" alt="" @click="drawer = true" />
      </div>
    </section>
    <!-- 音乐选歌 -->
    <div v-if="drawer">
      <MusicTable :canOrder="canOrder" :list="musicList" :songCode="nowMusic.songCode" :orderMusic="orderMusic"
        @goOrder="goOrder" @close="drawer = false"></MusicTable>
    </div>
    <!-- for test -->
    <TestView :data="testData" @skipPrelude="skipPrelude"></TestView>
    <!-- for test -->
  </div>
</template>

<script>
import LyricsView from "../components/LyricsView/index.vue";
import GradeView from "../components/GradeView/index.vue";
import MusicTable from "../components/MusicTable/index.vue";
import LineScoreView from "../components/LineScoreView/index.vue";
import IncentiveView from "../components/IncentiveView/index.vue";
import TestView from "../components/TestView/index.vue"
import VoiceSet from "../components/VoiceSet/index.vue"
import Engine, { EnumMessage } from "../engine/index.ts";
import { PitchDetectorExtension } from "../agora-extension-pitch-detector/index.es";
import { apiGetSongDetail, apiGetLyric, apiBuildToken, apiStopConfluence, apiStartConfluence } from "../utils/request";
import { getMusicList, PREFIX, stringToUint8Array, Uint8ArrayToString, genDelayAudioBuffer } from "../utils/index";


import imgPause from "../../img/pause.png"
import imgPlay from "../../img/play.png"

const AgoraRTC = window.AgoraRTC
let { MODE = "" } = import.meta.env;
const assetsPath = MODE == "development" ? "/" : PREFIX;
let appId = window?.appInfo?.appId
let token = null
const engine = Engine.getInstance();
const extension = new PitchDetectorExtension({ assetsPath });
AgoraRTC.registerExtensions([extension]);

// just for test
// engine.log.setLevel(0);
window.engine = engine;
const PROGRESS_INTERVAL_TIME = 20;
const DEFAULT_TEST_DATA = {
  scoreList: [],
  cursorY: 0,
  word: "",
  stdPitch: 0,
  voicePitch: 0,
  originalPitch: 0,
  currentTime: 0
}
const ENMU_BGM_STATUS = {
  IDLE: 0,
  PLAYING: 1,
  PAUSE: 2
}
let songIndex = 1;
let intervalIds = []
const BGM_PUBLISH_UID = 9528

const genMsg = (data) => {
  console.log("stream-message send", data)
  return stringToUint8Array(JSON.stringify(data))
}

export default {
  components: {
    LyricsView,
    GradeView,
    LineScoreView,
    IncentiveView,
    MusicTable,
    TestView,
    VoiceSet
  },
  data() {
    return {
      channel: this.$route.query.channel,
      drawer: false,
      canOrder: false,
      musicList: getMusicList(),
      nowMusic: {},
      orderMusic: [],
      client1: null,
      client2: null,
      audienceClient: null,
      localTracks: {
        audioTrack: null,
        videoTrack: null,
      },
      uid: "",
      originalTrack: null, // 原声
      accompaniedTrack: null, // 伴奏
      accompaniedDelayTrack: null, // 伴奏延迟
      loading: false,
      lyric: {}, // 歌词数据
      currentTime: 0, // 当前播放时间
      totalScore: 0, // 总分
      joinedRtc: false, // 是否加入rtc
      currentLine: -1, // 当前歌词行数 (结束)
      roleString: "",
      role: "",
      uid: "",
      testData: DEFAULT_TEST_DATA,
      vocalScore: 0,
      volume: 50,
      status: ENMU_BGM_STATUS.IDLE,
      flag: false,
      chorused: false // 是否开启合唱 （伴唱用）
    };
  },
  async created() {
    this.setParameter()
    this.calcInfo()
    if (this.role == 'host') {
      // 主唱 
      this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: false
      });
      await this.hostJoinRtc()
      this.intervalCanOrder()
      this.handleHostRtcEvents()
      if (this.localTracks.audioTrack) {
        await this.client1.publish(this.localTracks.audioTrack)
      }
      if (window.appInfo.type != 'test') {
        await this.startChorus()
        this.startPitchExtension();
        this.startConfluenceStreamMessage()
        this.startScoreStreamMessage()
        this.subscribeEngineEvents();
        this.startLyricTimer();
      }
    } else if (this.role == 'accompaniment') {
      // 伴唱
      this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: false
      });
      await this.accompanimentJoinRtc()
      await this.handleAccompanimentRtcEvents()
      await this.client1.publish(this.localTracks.audioTrack)
      if (window.appInfo.type != 'test') {
        this.startPitchExtension();
        this.startScoreStreamMessage()
        this.subscribeEngineEvents();
        this.startLyricTimer();
        this.handleStreamMsg()
      }
    } else {
      await this.audienceJoinRtc()
      // 观众
      this.handleAudienceRtcEvents()
    }
  },
  mounted() {
  },
  async beforeDestroy() {
    if (this.role == 'host') {
      await apiStopConfluence()
    }
    this.status = ENMU_BGM_STATUS.IDLE
    engine.destory();
    sessionStorage.removeItem("token");
    intervalIds.forEach(item => clearInterval(item))
    intervalIds = []
    await this.leaveRtc();
  },
  watch: {
    currentTime(val) {
      this.testData.currentTime = val
    }
  },
  computed: {
    toggleImgSrc() {
      return this.status === ENMU_BGM_STATUS.PLAYING ? imgPause : imgPlay
    }
  },
  methods: {
    setParameter() {
      AgoraRTC.setParameter("che.audio.max_mixed_participants", 8);
      AgoraRTC.setParameter("GATEWAY_ADDRESS", [{ "ip": "120.195.180.30", "port": 16000 }])
      AgoraRTC.setParameter("USE_XR", true)	// 开启 xr
      AgoraRTC.setParameter("ENABLE_NTP_REPORT", true)
      AgoraRTC.setParameter("NTP_DEFAULT_FIXED_OFFSET", window.ntpOffset);
    },
    updateVolume(val) {
      this.volume = val
      this.accompaniedTrack?.setVolume(this.volume);
      this.accompaniedDelayTrack?.setVolume(this.volume);
    },
    intervalCanOrder() {
      let startTime = Date.now()
      let id = setInterval(() => {
        if (this.canOrder) {
          clearInterval(id)
          return
        }
        const ms = this.client1.getNtpWallTimeInMs()
        const now = Date.now()
        const ntpOffset = ms - now
        if (ntpOffset != 0) {
          this.canOrder = true
          this.$message.success("可以点歌了");
          let endTime = Date.now()
          console.log(`[demo] canOrder: ${endTime - startTime} ms`,)
        }
      }, 300)

      intervalIds.push(id)
    },
    async hostJoinRtc() {
      this.client1 = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
        role: "host",
      });
      this.uid = await this.client1.join(appId, this.channel, token, this.uid);
      this.joinedRtc = true
    },
    async accompanimentJoinRtc() {
      this.client1 = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
        role: "host",
      });
      this.uid = await this.client1.join(appId, this.channel, token, this.uid);
      this.joinedRtc = true
    },
    async audienceJoinRtc() {
      this.audienceClient = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
        role: "audience",
      });
      await this.audienceClient.join(appId, this.channel + "_ad", token, null);
      this.joinedRtc = true
    },
    // 开启合流服务
    async startConfluenceService() {
      await apiBuildToken()
      await apiStartConfluence(this.channel)
    },
    // 主唱处理rtc事件
    handleHostRtcEvents() {
      this.client1.on("user-published", async (user, mediaType) => {
        const uid = user.uid
        if (uid == BGM_PUBLISH_UID) {
          return
        }
        await this.client1.subscribe(user, mediaType)
        if (mediaType == 'audio') {
          user.audioTrack?.play();
        }
      })
      this.client1.on("user-unpublished", async (user, mediaType) => {
        const uid = user.uid
        if (uid == BGM_PUBLISH_UID) {
          return
        }
        await this.client1.unsubscribe(user, mediaType)
        if (mediaType == 'audio') {
          user.audioTrack?.stop();
        }
      })
    },
    // 伴唱处理rtc事件
    handleAccompanimentRtcEvents() {
      this.client1.on("user-published", async (user, mediaType) => {
        const uid = user.uid
        if (uid == BGM_PUBLISH_UID) {
          return
        }
        await this.client1.subscribe(user, mediaType)
        if (mediaType == 'audio') {
          user.audioTrack.play();
        }
      })
      this.client1.on("user-unpublished", async (user, mediaType) => {
        const uid = user.uid
        if (uid == BGM_PUBLISH_UID) {
          return
        }
        await this.client1.subscribe(user, mediaType)
        if (mediaType == 'audio') {
          user.audioTrack.stop();
        }
      })
    },
    // 观众处理rtc事件
    handleAudienceRtcEvents() {
      this.audienceClient.on("user-published", async (user, mediaType) => {
        await this.audienceClient.subscribe(user, mediaType)
        if (mediaType == 'audio') {
          user.audioTrack.play();
        }
      })
      this.audienceClient.on("user-unpublished", async (user, mediaType) => {
        await this.audienceClient.subscribe(user, mediaType)
        if (mediaType == 'audio') {
          user.audioTrack.stop();
        }
      })
    },
    startConfluenceStreamMessage() {
      let id = setInterval(() => {
        if (this.chorused) {
          this.client1.sendStreamMessage(genMsg({
            service: "audio_smart_mixer_status",
            version: "V1",
            payload: {
              Ts: this.client1.getNtpWallTimeInMs(),
              cname: this.channel,
              status: this.status,
              bgmUID: BGM_PUBLISH_UID + "",
              leadsingerUID: this.uid + ""
            }
          }))
        }
      }, 200)
      intervalIds.push(id)
    },
    startScoreStreamMessage() {
      let id = setInterval(() => {
        if (this.status !== ENMU_BGM_STATUS.IDLE && this.status !== ENMU_BGM_STATUS.PAUSE) {
          this.client1.sendStreamMessage(genMsg({
            service: "audio_smart_mixer",
            version: "V1",
            payload: {
              cname: this.channel,
              uid: this.uid + "",
              uLv: -1,
              specialLabel: 0,
              audioRoute: 3,
              vocalScore: this.vocalScore
            }
          }))
        }
      }, 3000)
      intervalIds.push(id)
    },
    calcInfo() {
      const isSelect = this.$route.query.isSelect
      switch (isSelect) {
        case "1":
          this.role = "host"
          this.roleString = "主唱"
          this.uid = 2
          break
        case "2":
          this.role = "accompaniment"
          this.roleString = "伴唱"
          break
        case "3":
          this.role = "audience"
          this.roleString = "观众"
          break
      }
    },
    startLyricTimer() {
      const timer = setInterval(() => {
        if (this.nowMusic.songCode && this.status !== ENMU_BGM_STATUS.IDLE) {
          let time = this.accompaniedTrack?.getCurrentTime() || 0
          this.currentTime = time;
          engine.setTime(this.currentTime);
        }
      }, PROGRESS_INTERVAL_TIME);
      intervalIds.push(timer)
    },
    async playBgm() {
      this.status = ENMU_BGM_STATUS.PLAYING
      this.accompaniedTrack?.play();
      this.accompaniedTrack?.startProcessAudioBuffer();
      if (this.role == 'host') {
        this?.accompaniedDelayTrack?.startProcessAudioBuffer()
        await this.client2?.publish(this?.accompaniedDelayTrack);
        if (!this.flag) {
          this.flag = true
          await this.startConfluenceService()
        }
        this.client1.sendStreamMessage(genMsg({
          type: 4,
          ntp: this.client1.getNtpWallTimeInMs(),
          songCode: this.nowMusic.songCode,
          status: this.status,
          position: 0
        }));
      } else if (this.role == "accompaniment") {
        this.seekBGMProgress(this.currentTime)
      }
    },
    async createBgmAudioTracks() {
      var audioContext = new AudioContext();
      const res = await fetch(this.nowMusic.accompanyUrl)
      const arrayBuffer = await res.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const delayAudioBuffer = genDelayAudioBuffer(audioBuffer, window.publishDelay)
      console.log("accompaniedTrack AudioBuffer", audioBuffer)
      console.log("accompaniedTrack AudioBuffer after delay", delayAudioBuffer)
      this.accompaniedTrack = await AgoraRTC.createBufferSourceAudioTrack({
        source: audioBuffer,
      });
      this.accompaniedDelayTrack = await AgoraRTC.createBufferSourceAudioTrack({
        source: delayAudioBuffer,
      });
      this.accompaniedTrack.setVolume(this.volume);
      this.accompaniedDelayTrack.setVolume(this.volume);
      await this.playBgm()
    },
    async leaveRtc() {
      if (!this.joinedRtc) {
        return;
      }
      this.joinedRtc = false;
      for (let trackName in this.localTracks) {
        var track = this.localTracks[trackName];
        if (track) {
          track.stop();
          track.close();
          this.localTracks[trackName] = null;
        }
      }
      // if (this.originalTrack) {
      //   this.originalTrack.stopProcessAudioBuffer();
      //   this.originalTrack.stop();
      //   this.originalTrack.close();
      //   this.originalTrack = null;
      // }
      if (this.accompaniedTrack) {
        this.accompaniedTrack.stopProcessAudioBuffer();
        this.accompaniedTrack.stop();
        this.accompaniedTrack.close();
        this.accompaniedTrack = null;
      }
      await this.client1?.leave();
      await this.client2?.leave();
      await this.audienceClient?.leave();
    },
    // 开启音调检测插件
    startPitchExtension() {
      if (extension.checkCompatibility()) {
        const processor = extension.createProcessor();
        try {
          this.localTracks.audioTrack.pipe(processor).pipe(this.localTracks.audioTrack.processorDestination);
          // 50ms检测一次
          processor.setInterval(50);
        } catch (error) {
          console.error(error);
        }
        processor.on("pitchInfo", (info) => {
          if (this.status !== ENMU_BGM_STATUS.IDLE) {
            const pitch = info.voicePitch;
            engine.setPitch(pitch);
          }
        });
      }
    },
    // 订阅engine事件
    subscribeEngineEvents() {
      engine.on("draw", (data) => {
        this.$refs.lineScoreViewRef?.draw(data);
      });
      engine.on("cursor", (data) => {
        const { x, y } = data;
        this.$refs.lineScoreViewRef?.drawCursor(y);
        this.testData.cursorY = y;
      });
      engine.on("cursorTailAnim", (show) => {
        if (show) {
          this.$refs.lineScoreViewRef?.showCursorTailAnim();
        } else {
          // do something
          this.$refs.lineScoreViewRef?.clearCursorTailAnim();
        }
      });
      engine.on("timeUpdate", (data) => {
        const { progress } = data
        if (this.joinedRtc && this.role == 'host' && this.status != ENMU_BGM_STATUS.PAUSE) {
          this.client1.sendStreamMessage(genMsg({
            type: 4,
            ntp: this.client1.getNtpWallTimeInMs(),
            songCode: this.nowMusic.songCode,
            status: this.status,
            position: parseInt(progress * 1000 - window.audioDeviceDelay)
          }));
        }
      });
      engine.on("lineEnd", async (data) => {
        const { line, score, combo } = data;
        this.currentLine = line;
        this.vocalScore = score
        this.$refs.gradeViewRef?.updateScore(score);
        this.testData.scoreList?.push({
          score,
          combo,
        });
        this.$refs.incentiveViewRef?.show(combo);
        this.$refs.lineScoreViewRef?.scoreAnim(score);
        if (line == engine.totalLine - 1) {
          // 最后一句 （状态改为结束）
          this.status = ENMU_BGM_STATUS.IDLE
          if (this.role == 'host') {
            this.client1.sendStreamMessage(genMsg({
              type: 4,
              ntp: this.client1.getNtpWallTimeInMs(),
              songCode: this.nowMusic.songCode,
              status: this.status,
              position: -1
            }));
          }
        }
      });
      engine.on("hit", (data) => {
        const { originalPitch, voicePitch, stdPitch, word } = data;
        this.testData.word = word;
        this.testData.originalPitch = originalPitch;
        this.testData.voicePitch = voicePitch;
        this.testData.stdPitch = stdPitch;
      });
    },
    // 获取歌曲详情
    async getSongDetail(songCode) {
      engine.reset();
      // 重置分数
      this.$refs.gradeViewRef.setScore(0);
      // 重置句子
      this.lyric = {};
      this.currentLine = 0;
      this.currentTime = 0;
      this.testData = DEFAULT_TEST_DATA
      try {
        const res = await apiGetSongDetail({
          songCode: songCode,
        });
        const { extra = {} } = res || {};
        const { accompanyUrl } = extra;
        this.nowMusic.playUrl = res.playUrl;
        this.nowMusic.lyric = res.lyric;
        this.nowMusic.accompanyUrl = accompanyUrl;
        this.nowMusic.songCode = songCode
        if (this.accompaniedTrack) {
          this.accompaniedTrack.stopProcessAudioBuffer();
          this.accompaniedTrack.stop();
          this.accompaniedTrack.close();
          this.accompaniedTrack = null;
        }
        if (this.accompaniedDelayTrack) {
          this.accompaniedDelayTrack.stopProcessAudioBuffer();
          this.accompaniedDelayTrack.stop();
          this.accompaniedDelayTrack.close();
          this.accompaniedDelayTrack = null;
        }
        await Promise.all([
          this.createBgmAudioTracks(),
          this.handleLyc()
        ])
      } catch (err) {
        console.error(err);
        this.$message.error("网络异常,请重试");
      }
    },
    // 点歌
    async goOrder(songCode) {
      const start = Date.now();
      this.loading = true;
      const target = this.musicList.find((i) => i.songCode == songCode);
      this.nowMusic = target;
      this.orderMusic.push(target);
      this.musicList.forEach((i) => {
        if (i.songCode == songCode) {
          i.select = true;
        }
      });
      this.client1.sendStreamMessage(
        genMsg({
          type: EnumMessage.order,
          songCode: Number(songCode),
          songIndex: songIndex,
        })
      );
      songIndex++;
      await this.getSongDetail(songCode);
      this.loading = false;
      const end = Date.now();
      console.log("点歌耗时", end - start);
    },
    //退出房间
    async backout() {
      this.$router.back();
    },
    // 切换播放转态
    togglePlay() {
      //清空粒子
      this.$refs.lineScoreViewRef.clearParticle();
      if (this.status == ENMU_BGM_STATUS.PLAYING) {
        this.stopPlay()
      } else {
        this.continuePlay()
      }
    },
    // 暂停播放
    stopPlay() {
      this.status = ENMU_BGM_STATUS.PAUSE;
      this.accompaniedTrack?.pauseProcessAudioBuffer();
      this.accompaniedDelayTrack?.pauseProcessAudioBuffer();
      if (this.role == 'host') {
        this.client1.sendStreamMessage(genMsg({
          type: 4,
          ntp: this.client1.getNtpWallTimeInMs(),
          songCode: this.nowMusic.songCode,
          status: this.status,
          position: -1
        }));
      }
    },
    // 继续播放
    continuePlay() {
      this.accompaniedTrack?.resumeProcessAudioBuffer();
      this.accompaniedDelayTrack?.resumeProcessAudioBuffer();
      this.status = ENMU_BGM_STATUS.PLAYING;
    },
    // 跳过前奏
    skipPrelude() {
      if (this.status == ENMU_BGM_STATUS.IDLE) {
        return;
      }
      const firstLineStartTime = this.lyric.lines[0].beginTime;
      this.seekBGMProgress(firstLineStartTime);
    },
    // 设置进度 s
    seekBGMProgress(time) {
      if (time < 0) {
        return
      }
      console.log("seekBGMProgress", time)
      if (this.status === ENMU_BGM_STATUS.IDLE) {
        return;
      }
      if (!this.originalTrack && !this.accompaniedTrack) {
        return;
      }
      // this.originalTrack.seekAudioBuffer(time);
      this.accompaniedTrack.seekAudioBuffer(time);
    },
    async handleLyc() {
      const resZip = await apiGetLyric(this.nowMusic.lyric);
      this.lyric = await engine.setLyric(resZip);
      this.totalScore = engine.totalScore;
    },
    // 处理stream msg (伴唱)
    handleStreamMsg() {
      this.client1.on("stream-message", (uid, data) => {
        data = JSON.parse(Uint8ArrayToString(data))
        const { type, songCode, status, position = 0, ntp } = data
        if (!type) {
          return
        }
        console.log("stream-message received", data)
        switch (type) {
          case 3:
            // 点歌
            if (songCode !== this.nowMusic.songCode) {
              this.getSongDetail(songCode)
            }
            break
          case 4:
            // 转态改变
            let newTime = position / 1000
            newTime = newTime > 0 ? newTime : 0
            if (this.status == ENMU_BGM_STATUS.IDLE) {
              // 未开始时记录远端主唱进度
              this.currentTime = newTime
            } else {
              let localPosition = 0  // 需要ms
              localPosition = this.accompaniedTrack?.getCurrentTime() * 1000
              const localNtpTime = this.client1.getNtpWallTimeInMs()
              const remoteNtpTime = ntp
              const remotePosition = position
              let exportPosition = localNtpTime - remoteNtpTime + remotePosition + window.audioDeviceDelay
              if (Math.abs(exportPosition - localPosition) > 40) {
                newTime = exportPosition / 1000
                this.currentTime = newTime
                this.seekBGMProgress(newTime)
              }
              if (this.status !== status) {
                if (status == ENMU_BGM_STATUS.PLAYING) {
                  // 需要播放
                  this.continuePlay()
                } else if (status == ENMU_BGM_STATUS.PAUSE) {
                  // 需要暂停
                  this.stopPlay()
                }
              }
            }
            break
        }
      });
    },
    // 开始合唱
    async startChorus() {
      this.chorused = true
      // 发人声
      if (!this.client2) {
        this.client2 = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8",
          role: "host",
        });
        await this.client2.join(appId, this.channel, token, BGM_PUBLISH_UID);
      }
    },
    // 结束合唱
    async endChorus() {
      await apiStopConfluence()
      if (this.localTracks.audioTrack) {
        this.client1.unpublish(this.localTracks.audioTrack)
      }
      if (this.accompaniedTrack) {
        await this.client2.unpublish(this.accompaniedTrack);
      }
      this.chorused = false
    },
  }
}
</script>

<style lang="scss" scoped>
.main {
  width: 375px;
  height: 667px;
  overflow: auto;
  overflow-x: hidden;
  user-select: none;
  -webkit-touch-callout: none;

  ::-webkit-scrollbar {
    display: none;
    /* Chrome Safari */
  }

  margin: 0 auto;
  box-shadow: 14px 2px 10px 0px;
  background: url("../../img/back.png") 0 0 no-repeat;
  background-size: 100% 100%;
  padding: 20px 20px 50px;
  position: relative;

  .img {
    width: 24px;
    height: 24px;
    margin: 10px;
  }

  .chanleNane {
    font-weight: 500;
    color: #ffffff;
    line-height: 22px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
  }

  .backout {
    width: 20px;
    height: 20px;
  }

  .bottom {
    position: absolute;
    bottom: 20px;
    left: 10px;
    right: 10px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;

    .order {
      margin-right: 10px;
      height: 28px;
    }
  }

  .buttonList {
    position: absolute;
    bottom: 0;
    left: 10px;
    right: 10px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
  }

  .lyric-wrapper {
    position: relative;
    background: url("../../img/b.png") 0 0 no-repeat;
    background-size: 100% 100%;
  }

  .el-tabs--border-card,
  .el-tabs__header,
  .el-tabs__item {
    background: #232d61 !important;
    border: 1px solid #232d61 !important;
  }

  .el-tabs--border-card {
    box-shadow: 0 0 0 0;
  }

  .line-score-wrapper {
    margin-top: 15px;
  }

  .voiceSet {
    color: #fff;
    height: 40px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;

    i {
      width: 10%;
    }

    .line {
      width: 80%;
    }
  }
}

.chorus {
  position: absolute;
  bottom: 12px;
  left: 50px;
  display: inline-block;
}
</style>
