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
import { getMusicList, PREFIX, stringToUint8Array, Uint8ArrayToString, genDelayAudioBuffer, setupSenderTransform } from "../utils/index";
import { throttle } from "lodash-es"
import { decodeAudioMetadata, encodeAudioMetadata, encodeStreamMsg, decodeStreamMsg, encodeNTP, decodeNTP } from "../utils/index"
import imgPause from "../../img/pause.png"
import imgPlay from "../../img/play.png"
import AudioBufferManager from "../utils/manager"

const AgoraRTC = window.AgoraRTC
let { MODE = "" } = import.meta.env;
const assetsPath = MODE == "development" ? "/" : PREFIX;
let appId = window?.appInfo?.appId
let token = null
const engine = Engine.getInstance();
const extension = new PitchDetectorExtension({ assetsPath });
AgoraRTC.registerExtensions([extension]);
let manager = null
// let intervalId = null

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
  PLAYING: 3,
  PAUSE: 4
}
let songIndex = 1;
let intervalIds = []
const BGM_PUBLISH_UID = 9528
const HOST_UID = 2

// 针对观众
// 上一次系统时间
let preSysTime = 0
// 上一次真实时间
let preRealPosition = 0


const throttleSeek = throttle(function (number, fn) {
  fn(number)
  console.log("throttle seekBGMProgress", number)
}, 1000)

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
      originalTrack: null, // 原声
      accompaniedTrack: null, // 伴奏
      accompaniedDelayTrack: null, // 伴奏延迟
      loading: false,
      canPlay: false, // 是否能播放
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
      chorused: false // 是否开启合唱 （伴唱用）
    };
  },
  async created() {
    this.calcInfo()
    this.setParameter()
    if (this.role == 'host') {
      // 主唱 
      this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: false
      });
      await this.hostJoinRtc()
      this.intervalCanOrder()
      this.handleHostRtcEvents()
      if (this.localTracks.audioTrack) {
        // this.localTracks.audioTrack.on("transceiver-updated", setupSenderTransform)
        await this.client1.publish(this.localTracks.audioTrack)
      }
      if (window.appInfo.type != 'test') {
        await this.startConfluenceService()
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
      // this.localTracks.audioTrack.on("transceiver-updated", setupSenderTransform)
      await this.client1.publish(this.localTracks.audioTrack)
      if (window.appInfo.type != 'test') {
        this.startPitchExtension();
        this.startScoreStreamMessage()
        this.subscribeEngineEvents();
        this.startLyricTimer();
        this.handleStreamMsg(this.client1)
      }
    } else {
      // 观众
      await this.audienceJoinRtc()
      // this.handleStreamMsg(this.audienceClient)
      this.subscribeEngineEvents();
      this.handleAudienceRtcEvents()
    }
  },
  mounted() {
    window.addEventListener('beforeunload', async (e) => {
      if (this.role == 'host' && this.chorused) {
        await this.endChorus()
      }
      e.preventDefault();
      e.returnValue = '';
    });
  },
  async beforeDestroy() {
    if (this.role == 'host') {
      await this.endChorus()
    }
    if (this.localTracks.audioTrack) {
      this.client1?.unpublish(this.localTracks.audioTrack)
    }
    if (this.accompaniedTrack) {
      await this.client2?.unpublish(this.accompaniedTrack);
    }
    this.status = ENMU_BGM_STATUS.IDLE
    engine.destory();
    sessionStorage.removeItem("token");
    intervalIds.forEach(item => clearInterval(item))
    intervalIds = []
    await this.leaveRtc();
    // if (intervalId) {
    //   clearInterval(intervalId)
    //   intervalId = null
    // }
  },
  watch: {
    currentTime(val) {
      this.testData.currentTime = val
    },
    // currentLine(val) {
    //   console.log("currentLine", val)
    // }
  },
  computed: {
    toggleImgSrc() {
      return this.status === ENMU_BGM_STATUS.PLAYING ? imgPause : imgPlay
    }
  },
  // AgoraRTC.setParameter("rtc.enable_nasa2", true)
  methods: {
    setParameter() {
      AgoraRTC.setParameter("GATEWAY_ADDRESS", [{ "ip": "120.195.180.30", "port": 16000 }]) // 仅测试环境需要
      AgoraRTC.setParameter("USE_XR", true)	// 开启 xr
      AgoraRTC.setParameter("ENABLE_NTP_REPORT", true)
      AgoraRTC.setParameter("NTP_DEFAULT_FIXED_OFFSET", window.ntpOffset);
      AgoraRTC.setParameter("TOPN_SMOOTH_LEVEL", window.TOPN_SMOOTH_LEVEL);
      // AUDIO_METADATA
      AgoraRTC.setParameter("ENABLE_ENCODED_TRANSFORM", !!window.ENABLE_ENCODED_TRANSFORM);
      AgoraRTC.setParameter("ENABLE_AUDIO_METADATA", true);
      // AUDIO_METADATA
      AgoraRTC.setParameter("ENABLE_AUDIO_TOPN", !!window.ENABLE_AUDIO_TOPN);
      AgoraRTC.setParameter("TOPN_NEW_SPEAKER_DELAY", window.TOPN_NEW_SPEAKER_DELAY);
      window.TOPN_SWITCH_HOLD_MS && AgoraRTC.setParameter("TOPN_SWITCH_HOLD_MS", window.TOPN_SWITCH_HOLD_MS);
      window.TOPN_AUDIO_GAIN && AgoraRTC.setParameter("TOPN_AUDIO_GAIN", window.TOPN_AUDIO_GAIN);
      if (this.role == 'host') {
        AgoraRTC.setParameter("ENABLE_PUBLISH_AUDIO_FILTER", false)
        AgoraRTC.setParameter("SUBSCRIBE_AUDIO_FILTER_TOPN", window.topN)
      } else {
        AgoraRTC.setParameter("SUBSCRIBE_AUDIO_FILTER_TOPN", window.topN - 1)
      }
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
      this.client1.on("media-reconnect-start", uid => {
        if (uid == HOST_UID) {
          this.$message.error(`主唱尝试重新建立媒体连接! uid: ${uid}`);
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
      this.audienceClient.on("audio-metadata", async (metadata) => {
        const res = decodeAudioMetadata(metadata);
        const { ts, songId } = res
        if (songId && songId != this.nowMusic.songCode) {
          this.nowMusic.songCode = songId
          await this.getSongDetail(songId);
        }
        this.currentTime = (ts - window.renderDelay) / 1000
        engine.setTime(this.currentTime);
      });
    },
    startConfluenceStreamMessage() {
      let id = setInterval(() => {
        if (this.chorused) {
          let finalStatus = 0
          if (this.status == ENMU_BGM_STATUS.PLAYING) {
            finalStatus = 1
          } else if (this.status == ENMU_BGM_STATUS.PAUSE) {
            finalStatus = 2
          }
          this.client1.sendStreamMessage({
            payload: encodeStreamMsg({
              service: "audio_smart_mixer_status",
              version: "V1",  // 协议版本号
              payload: {
                Ts: encodeNTP(this.client1.getNtpWallTimeInMs()), // NTP 时间
                cname: this.channel, // 频道名
                status: finalStatus, // （-1： unknown，0：非K歌状态，1：K歌播放状态，2：K歌暂停状态）
                bgmUID: BGM_PUBLISH_UID + "", // BGM 流 UID
                leadsingerUID: this.uid + ""// 主唱Uid
              },
            }),
            syncWithAudio: true,
          })
        }
      }, 200)
      intervalIds.push(id)
    },
    startScoreStreamMessage() {
      let id = setInterval(() => {
        if (this.status !== ENMU_BGM_STATUS.IDLE && this.status !== ENMU_BGM_STATUS.PAUSE) {
          this.client1.sendStreamMessage({
            payload: encodeStreamMsg({
              service: "audio_smart_mixer",
              version: "V1", // 协议版本号
              payload: {
                cname: this.channel, // 频道名
                uid: this.uid + "", // 自己的uid，主频道
                uLv: -1, // user-leve1（用户级别，若无则为 -1，Level 越高，越重要）
                specialLabel: 0,  //0: default-mode ，1：这个用户需要被排除出智能混音
                audioRoute: 3,  // 音频路由：监听 onAudioRouteChanged
                vocalScore: this.vocalScore// 单句打分
              },
            }),
            syncWithAudio: true,
          })
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
          this.uid = HOST_UID
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
      console.log("playBgm", this.currentTime)
      this.status = ENMU_BGM_STATUS.PLAYING
      this.accompaniedTrack?.play();
      this.accompaniedTrack?.startProcessAudioBuffer();
      if (this.role == 'host') {
        this?.accompaniedDelayTrack?.startProcessAudioBuffer()
        await this.client2?.publish(this?.accompaniedDelayTrack);
        this.client1.sendStreamMessage({
          payload: encodeStreamMsg({
            cmd: "setLrcTime",
            ntp: encodeNTP(this.client1.getNtpWallTimeInMs()),
            songIdentifier: this.nowMusic.songCode,
            playerState: this.status,
            time: 0,
            realTime: 0,
            duration: Math.floor(this.accompaniedTrack?.duration * 1000),
            forward: true
          }),
          syncWithAudio: true
        })
      } else if (this.role == "accompaniment") {
        this.seekBGMProgress(this.currentTime)
      }
    },
    async createBgmAudioTracks() {
      if (this.role == "audience") {
        return
      }
      var audioContext = new AudioContext();
      // const res = await fetch(this.nowMusic.accompanyUrl)
      const res = await fetch(this.nowMusic.playUrl)
      // manager = new AudioBufferManager(this.nowMusic.playUrl)
      // await manager.deal()
      // manager.play()

      const arrayBuffer = await res.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const delayAudioBuffer = genDelayAudioBuffer(audioBuffer, window.publishDelay)
      console.log("accompaniedTrack AudioBuffer", audioBuffer.length)
      console.log("accompaniedTrack AudioBuffer after delay", delayAudioBuffer.length)
      this.accompaniedTrack = await AgoraRTC.createBufferSourceAudioTrack({
        source: audioBuffer,
      });
      this.accompaniedDelayTrack = await AgoraRTC.createBufferSourceAudioTrack({
        source: delayAudioBuffer,
      });
      this.accompaniedTrack.setVolume(this.volume);
      this.accompaniedDelayTrack.setVolume(this.volume);
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
        if (this.role == "audience") {
          return
        }
        const { progress } = data
        if (this.joinedRtc && this.role == 'host' && this.status != ENMU_BGM_STATUS.PAUSE) {
          let time = parseInt(progress * 1000 - window.audioDeviceDelay)
          let realTime = parseInt(progress * 1000) - window.publishDelay
          let songCode = this.nowMusic.songCode
          this.client1.sendStreamMessage({
            payload: encodeStreamMsg({
              cmd: "setLrcTime",
              ntp: encodeNTP(this.client1.getNtpWallTimeInMs()),
              songIdentifier: songCode,
              playerState: this.status,
              time: time,
              realTime: realTime,
              duration: Math.floor(this.accompaniedTrack?.duration * 1000),
              forward: true,
            }),
            syncWithAudio: true,
          });
          if (this.role == 'host') {
            const metadata = encodeAudioMetadata({
              cmd: "setLrcTime",
              type: 1001,
              ts: realTime,
              songId: songCode,
              forward: true,
              uid: BGM_PUBLISH_UID,
            });
            this.client2.sendAudioMetadata({
              value: metadata
            })
          }
        }
      });
      engine.on("lineEnd", async (data) => {
        console.log("lineEnd", data)
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
          // TO
          // 最后一句 （状态改为结束）
          this.status = ENMU_BGM_STATUS.IDLE
          this.canPlay = false
          preRealPosition = 0
          preSysTime = 0
          if (this.role == 'host') {
            this.client1.sendStreamMessage({
              payload: encodeStreamMsg({
                cmd: "setLrcTime",
                ntp: encodeNTP(this.client1.getNtpWallTimeInMs()),
                songIdentifier: this.nowMusic.songCode,
                playerState: this.status,
                time: -1,
                realTime: -1,
                duration: Math.floor(this.accompaniedTrack?.duration * 1000),
                forward: true,
              }),
              syncWithAudio: true,
            });
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
        this.canPlay = true
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
      songIndex++;
      this.reset()
      await this.getSongDetail(songCode);
      if (this.role == 'host') {
        await this.playBgm()
      }
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
        const songCode = this.nowMusic.songCode
        this.client1.sendStreamMessage({
          payload: encodeStreamMsg({
            cmd: "setLrcTime",
            ntp: encodeNTP(this.client1.getNtpWallTimeInMs()),
            songIdentifier: songCode,
            playerState: this.status,
            time: -1,
            realTime: -1,
            duration: Math.floor(this.accompaniedTrack?.duration * 1000),
            forward: true,
          }),
          syncWithAudio: true,
        })

      }
    },
    // 继续播放
    continuePlay() {
      this.status = ENMU_BGM_STATUS.PLAYING;
      this.accompaniedTrack?.resumeProcessAudioBuffer();
      this.accompaniedDelayTrack?.resumeProcessAudioBuffer();
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
      this.accompaniedTrack.seekAudioBuffer(time);
    },
    async handleLyc() {
      const resZip = await apiGetLyric(this.nowMusic.lyric);
      this.lyric = await engine.setLyric(resZip);
      this.totalScore = engine.totalScore;
    },
    // 处理stream msg (伴唱/观众)
    handleStreamMsg(client) {
      client.on("stream-message", async (uid, data) => {
        data = decodeStreamMsg(data)
        let { cmd, playerState, time = 0, realTime = 0, ntp = 0, songIdentifier } = data
        ntp = decodeNTP(ntp)
        if (!cmd) {
          return
        }
        console.log("stream-message received", data)
        switch (cmd) {
          case "setLrcTime":
            if (this.role == 'accompaniment') {
              // 伴唱
              if (songIdentifier && songIdentifier !== this.nowMusic.songCode) {
                this.nowMusic.songCode = songIdentifier
                // 点歌
                this.reset()
                await this.getSongDetail(songIdentifier)
                return
              }
              if (!this.canPlay) {
                this.currentTime = time / 1000
                return
              }
              if (this.status == ENMU_BGM_STATUS.IDLE && time > 0) {
                this.currentTime = time / 1000
                await this.playBgm()
                return
              }
              let localPosition = this.accompaniedTrack?.getCurrentTime() * 1000
              const localNtpTime = this.client1?.getNtpWallTimeInMs() || this.audienceClient?.getNtpWallTimeInMs()
              const remoteNtpTime = ntp
              const remotePosition = time
              let exportPosition = localNtpTime - remoteNtpTime + remotePosition + window.audioDeviceDelay
              if (Math.abs(exportPosition - localPosition) > 40) {
                this.currentTime = exportPosition / 1000
                throttleSeek(this.currentTime, this.seekBGMProgress.bind(this))
              }
              if (this.status !== playerState) {
                if (playerState == ENMU_BGM_STATUS.PLAYING) {
                  // 需要播放
                  this.continuePlay()
                } else if (playerState == ENMU_BGM_STATUS.PAUSE) {
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
      if (!this.chorused) {
        return
      }
      await apiStopConfluence()
      this.chorused = false
    },
    reset() {
      engine.reset();
      this.status = ENMU_BGM_STATUS.IDLE
      this.canPlay = false
      // 重置分数
      this.$refs.gradeViewRef.setScore(0);
      // 重置句子
      this.lyric = {};
      this.currentLine = 0;
      this.currentTime = 0;
      this.testData = DEFAULT_TEST_DATA
      preRealPosition = 0
      preSysTime = 0
    }
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
