export enum MusicType {
  /// 快歌
  fast,
  /// 慢歌
  slow,
}

export enum Lang {
  zh = 1,
  en = 2,
  unknown = -1,
}

export interface LyricModel {
  /// 歌曲名称
  name: string;
  /// 歌星名称
  singer: string;
  /// 歌曲类型
  type: MusicType;
  /// 行信息
  lines: LyricLineModel[];
  /// 前奏结束时间  (start开始时间)
  preludeEndPosition: number;
  /// 总时长 (ms) (end 结束时间)
  duration: number;
  /// 是否有pitch值
  hasPitch: boolean;
}

export interface LyricLineModel {
  /// 开始时间 单位为毫秒
  beginTime: number;
  /// 总时长 (ms)
  duration: number;
  /// 行内容
  content: string;
  /// 每行歌词的字信息
  tones: LyricToneModel[];
  // 得分
  score: number;
}

export interface LyricToneModel {
  beginTime: number;
  duration: number;
  word: string;
  pitch: number;
  lang: Lang;
  pronounce: string;
  scores: number[]; // 得分
}

export interface ReactInfo {
  x: number;
  y: number;
  width: number;
}

export enum EnumCombo {
  fair = "fair",
  good = "good",
  excellent = "excellent",
}

export type Combo = {
  type: EnumCombo;
  num: number; // 数量
};

export type Position = {
  x: number;
  y: number;
};

// engine 对外抛的事件
export type EngineEvents = {
  cursor: Position;
  // 每次绘制的数据
  draw: {
    filterReactInfo: ReactInfo[];
    filterColoringReactInfo: ReactInfo[];
  };
  // 展示粒子动画
  cursorTailAnim: boolean;
  // 每秒时间
  timeUpdate: {
    progress: number; // 当前时间 s
    score: number; /// 句子的分数
    lineIndex: number; /// 句子索引
    cumulativeScore: number; /// 累计分数
  };
  // 一句歌词结束
  lineEnd: {
    line: number;
    score: number;
    combo?: Combo;
  };
  hit: {
    word: string; // 命中的字
    stdPitch: number; // 标准音高
    voicePitch: number; // 声音音高 (处理过后)
    originalPitch: number; // 原始音高 (rtc抛出)
  };
};

export enum EnumMessage {
  lyric = 0, // 同步歌词
  pitch = 1, // 同步pitch
  exit = 2, // 退出房间，
  order = 3, // 点歌
}

export type Message = {
  type: EnumMessage;
  [name: string]: any;
};
