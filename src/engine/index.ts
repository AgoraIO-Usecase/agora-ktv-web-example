import { LyricModel, LyricLineModel, LyricToneModel, ReactInfo, Combo, EnumCombo, EngineEvents } from "./type";
import { SECOND_PX, LINE_VIEW_HEIGHT, LINE_VIEW_WIDTH, CURSOR_AREA_WIDTH, COLORING_REACT_TIME } from "./const";
import VoicePitchChanger from "./VoicePitchChanger";
import ToneCalculator from "./ToneCalculator";
// import Scheduler from "./Scheduler";
import { MessageHandler } from "./MessageHandler";
import { Parser } from "./Parser";
import Log from "./Log";
import {
  hasPitch,
  isHitScore,
  getHitInfo,
  getTotal,
  dealPitch,
  filterReact,
  getComboName,
  isClosedReact,
  isReactInTone,
  cutOffReact,
  getLineScore,
} from "./utils";
import mitt, { Emitter, Handler } from "mitt";

export * from "./const";
export * from "./type";

export default class Engine {
  lyric: LyricModel = {} as LyricModel;
  totalScore: number = 0; // 总分
  cumulativeScore = 0; // 累计分数
  pitchMin: number = 0; // 此歌曲的最低音高
  pitchMax: number = 0; // 此歌曲的最高音高
  pitchHeight: number = 0; // 此歌曲的音高区间
  reactInfo: ReactInfo[] = []; // 所有小块元素
  coloringReactInfo: ReactInfo[] = []; // 所有着色的小块元素
  currentTime: number = 0; // 当前时间戳 s
  toneCalculator: ToneCalculator; // 音高计算器
  voicePitchChanger: VoicePitchChanger; // 音高变化器
  // scheduler: Scheduler; // 调度器
  log: Log; // 日志
  messageHandler: MessageHandler; // 消息处理器
  parser: Parser; // 解析器
  // private
  private static _instance: Engine;
  private _timer: number = 0; // 计时器
  private _emitter: Emitter<EngineEvents>;
  private _pitchIsZeroCount: number = 0; // 音高为0的次数
  private lineIndex: number = 0; // 当前行数 (结束节点)
  // 连击map
  private _combo: {
    [name: string]: number;
  };

  static getInstance() {
    if (!Engine._instance) {
      Engine._instance = new Engine();
    }
    return Engine._instance;
  }

  constructor() {
    this.voicePitchChanger = new VoicePitchChanger();
    this.toneCalculator = new ToneCalculator();
    // this.scheduler = new Scheduler(INTERVAL_TIME);
    this.log = new Log();
    this.messageHandler = new MessageHandler();
    this.parser = new Parser();
    // private
    this._emitter = mitt();
    this._combo = {
      [EnumCombo.fair]: 0,
      [EnumCombo.good]: 0,
      [EnumCombo.excellent]: 0,
    };
  }

  get totalTime() {
    return this.lyric?.duration || 0
  }

  // ------------------  public  ------------------
  setTime(time: number) {
    this.currentTime = time;
    this._dealTime();
    this._dealReact();
    this._dealLine();
  }

  // 获取一行的combo
  getLineCombo(lineIndex: number): Combo | undefined {
    const preScore = this.lyric?.lines[lineIndex - 1]?.score || 0;
    const curScore = this.lyric?.lines[lineIndex]?.score || 0;
    const preComboName = getComboName(preScore);
    const curComboName = getComboName(curScore);
    if (curComboName) {
      if (curComboName != preComboName) {
        this._combo[curComboName] = 1;
      } else {
        this._combo[curComboName]++;
      }
      return {
        type: curComboName,
        num: this._combo[curComboName],
      };
    } else {
      this._combo = {
        [EnumCombo.fair]: 0,
        [EnumCombo.good]: 0,
        [EnumCombo.excellent]: 0,
      };
    }
  }

  // 设置歌曲数据 （每次点歌）
  async setLyric(zip: ArrayBuffer) {
    // 重置数据
    this.reset();

    const xmlText = await this.parser.unZip(zip);
    const data: any = this.parser.parserXml(xmlText);
    this.log.debug("xml", data);

    const { song = {} } = data;
    const { general = {}, midi_lrc = {} } = song;
    const { name, singer, type } = general;
    const { paragraph = {} } = midi_lrc;
    const { sentence } = paragraph;
    const firstSentence = sentence[0];
    const lastSentence = sentence[sentence.length - 1];
    const firstTone = firstSentence.tone[0];
    const lastTone = lastSentence.tone[lastSentence.tone.length - 1];
    this.lyric.name = name;
    this.lyric.singer = singer;
    this.lyric.type = type;
    this.lyric.lines = midi_lrc;
    this.lyric.preludeEndPosition = Number(firstTone._begin);
    this.lyric.duration = Number(lastTone._end);

    const lines: LyricLineModel[] = sentence.map(({ tone }: any) => {
      let str = "";
      let tones: LyricToneModel[] = [];
      for (let t of tone) {
        str += t.word;
        tones.push({
          beginTime: Number(t._begin),
          duration: Number(t._end) - Number(t._begin),
          word: t.word,
          pitch: Number(t._pitch),
          lang: t._lang,
          pronounce: t._pronounce,
          scores: [],
        });
      }
      const firstTone = tone[0];
      const lastTone = tone[tone.length - 1];

      return {
        beginTime: Number(firstTone._begin),
        duration: Number(lastTone._end) - Number(firstTone._begin),
        content: str,
        tones: tones,
        score: 0,
      };
    });

    this.lyric.lines = lines;
    this.lyric.hasPitch = hasPitch(lines);

    // 计算总分
    this.totalScore = getTotal(lines);
    // 计算 max min pitch
    const { min, max } = dealPitch(lines);
    this.pitchMin = min;
    this.pitchMax = max;
    this.pitchHeight = max - min;

    // 计算react块
    this._calcReactInfo();
    this.log.debug("lyric", this.lyric);
    this.log.debug("reactInfo", this.reactInfo);

    return this.lyric;
  }

  setPitch(pitch: number) {
    if (!this.reactInfo.length) {
      return;
    }
    if (pitch == 0) {
      this._pitchIsZeroCount++;
    } else {
      this._pitchIsZeroCount = 0;
    }
    if (pitch > 0 || this._pitchIsZeroCount > 10) {
      this._pitchIsZeroCount = 0;
      // 计算游标的y坐标
      const cursorY = this._pitchToY(pitch);
      // 抛出事件
      this.emit("cursor", {
        x: CURSOR_AREA_WIDTH,
        y: cursorY,
      });
    } else {
      this.emit("cursorTailAnim", false);
      return;
    }

    // 计算命中
    const hit = getHitInfo(this.lyric, this.currentTime);
    if (!hit) {
      return;
    }
    this.log.debug("hit", hit);
    // voice change
    const stdPitch = hit.pitch;
    const voicePitch = this.voicePitchChanger.handlePitch(stdPitch, pitch, this.pitchMax);
    // 计算分数
    const toneScore = this.toneCalculator.calcScore(voicePitch, stdPitch, 10, 0);
    this.emit("hit", {
      word: hit.word,
      stdPitch,
      voicePitch,
      originalPitch: pitch,
    });
    // 保存分数
    hit.scores.push(toneScore);
    if (isHitScore(toneScore)) {
      // 需要添加着色小块
      this._addNewColoringReactInfo(hit);
      this.emit("cursorTailAnim", true);
    } else {
      this.emit("cursorTailAnim", false);
    }
  }

  reset() {
    this.voicePitchChanger.reset();
    this._timer = 0;
    this._pitchIsZeroCount = 0;
    this.lineIndex = 0;
    this.coloringReactInfo = [];
    this.currentTime = 0;
    this.cumulativeScore = 0;
    this.totalScore = 0;
    this.pitchMin = 0;
    this.pitchMax = 0;
    this.pitchHeight = 0;
    this.lyric = {} as LyricModel;
  }

  destory() {
    this._emitter.all.clear();
    // this.scheduler.destroy();
  }

  on<Key extends keyof EngineEvents>(name: Key, fn: Handler<EngineEvents[Key]>) {
    this._emitter.on<typeof name>(name, fn);
  }

  off<Key extends keyof EngineEvents>(name: Key, fn?: Handler<EngineEvents[Key]>) {
    this._emitter.off<typeof name>(name, fn);
  }

  emit<Key extends keyof EngineEvents>(name: Key, data: EngineEvents[Key]) {
    this._emitter.emit<typeof name>(name, data);
  }

  // ------------------  private  ------------------
  private _pitchToY(pitch: number) {
    if (pitch < this.pitchMin) {
      pitch = this.pitchMin;
    }
    if (pitch > this.pitchMax) {
      pitch = this.pitchMax;
    }
    return ((pitch - this.pitchMin) / this.pitchHeight) * LINE_VIEW_HEIGHT;
  }

  private _calcReactInfo() {
    let reactInfo = [];
    for (let line of this.lyric.lines) {
      for (let tone of line.tones) {
        reactInfo.push({
          // word: tone.word,
          // CURSOR_AREA_WIDTH 游标区域偏移
          x: tone.beginTime * SECOND_PX + CURSOR_AREA_WIDTH,
          y: this._pitchToY(tone.pitch),
          width: tone.duration * SECOND_PX,
          word: tone.word,
        });
      }
    }
    this.reactInfo = reactInfo;
  }

  private _addNewColoringReactInfo(hit: LyricToneModel) {
    const { beginTime, duration } = hit;
    const hitStartTime = beginTime;
    const hitEndTime = hitStartTime + duration;
    let startTime = this.currentTime;
    let endTime = startTime + COLORING_REACT_TIME;
    if (endTime > hitEndTime) {
      // 不能超过tone词结束时间
      endTime = hitEndTime;
    }
    let react = {
      // CURSOR_AREA_WIDTH 游标区域偏移
      x: startTime * SECOND_PX + CURSOR_AREA_WIDTH,
      y: this._pitchToY(hit.pitch),
      width: (endTime - startTime) * SECOND_PX,
    };
    let last = this.coloringReactInfo[this.coloringReactInfo.length - 1];
    // 当前react和上一个react在同一个tone词中 且

    if (last && isClosedReact(last, react) && isReactInTone(last, hit)) {
      last = this.coloringReactInfo.pop()!;
      react.width = react.x + react.width - last.x;
      react.x = last.x;
    }

    this.coloringReactInfo.push(react);
  }

  // 处理react小块
  private _dealReact() {
    const startX = this.currentTime * SECOND_PX;
    const cursorX = startX + CURSOR_AREA_WIDTH;
    const endX = startX + LINE_VIEW_WIDTH;
    // 过滤小块 (当前屏幕) (需要考虑到截断)
    let filterReactInfo = filterReact(this.reactInfo, startX, endX);
    // 截断处理
    filterReactInfo = cutOffReact(filterReactInfo, startX, endX);
    // 过滤高亮小块 (当前屏幕) (需要考虑到截断)
    let filterColoringReactInfo = filterReact(this.coloringReactInfo, startX, cursorX);
    // 截断处理
    filterColoringReactInfo = cutOffReact(filterColoringReactInfo, startX, cursorX);
    // 抛出事件
    this.emit("draw", {
      filterReactInfo,
      filterColoringReactInfo,
    });
  }

  // 计算句子
  private _dealLine() {
    if (!this.lyric?.lines) {
      return;
    }
    let len = this.lyric.lines.length;
    for (let i = 0; i < len; i++) {
      const line = this.lyric.lines[i];
      const { beginTime, duration } = line;
      const endTime = beginTime + duration;
      if (this.currentTime >= endTime) {
        if (i > this.lineIndex) {
          // line change
          this.lineIndex = i;
          const score = getLineScore(line);
          line.score = score;
          this.cumulativeScore += score;
          const combo = this.getLineCombo(this.lineIndex);
          this.emit("lineEnd", {
            line: this.lineIndex,
            score,
            combo,
          });
          if (this.lineIndex == len - 1) {
            this.cumulativeScore = 0;
          }
          break;
        }
      }
    }
  }

  // 处理时间
  private _dealTime() {
    // 20 ms 一次，50次一秒
    if (this.currentTime && this._timer++ % 50 == 0) {
      let score = 0;
      if (this.lineIndex >= 0) {
        if (this.lyric?.lines) {
          score = this.lyric?.lines[this.lineIndex]?.score || 0;
        } else {
          score = 0;
        }
      }
      this._emitter.emit("timeUpdate", {
        progress: this.currentTime,
        lineIndex: this.lineIndex,
        cumulativeScore: this.cumulativeScore,
        score: score,
      });
    }
  }


}
