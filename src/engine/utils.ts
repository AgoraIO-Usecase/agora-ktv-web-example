import { LyricLineModel, ReactInfo, LyricToneModel, LyricModel, EnumCombo } from "./type";
import { COLORING_REACT_TIME, SECOND_PX, CURSOR_AREA_WIDTH, HIT_SCORE_THRESHOLD, FULL_MARK } from "./const";

export function getAverage(arr: number[] = []) {
  if (!arr.length) {
    return 0;
  }
  let total = arr.reduce((t, c) => t + c, 0);
  return total / arr.length;
}

export function hasPitch(lines: LyricLineModel[]) {
  for (let line of lines) {
    for (let tone of line.tones) {
      if (tone.pitch) {
        return true;
      }
    }
  }
  return false;
}

export function getTotal(lines: LyricLineModel[]) {
  return lines.length * 100;
}

export function dealPitch(lines: LyricLineModel[]) {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

  for (let line of lines) {
    for (let tone of line.tones) {
      if (tone.pitch < min) {
        min = tone.pitch;
      }
      if (tone.pitch > max) {
        max = tone.pitch;
      }
    }
  }

  return {
    min,
    max,
  };
}

export function cutOffReact(reacts: ReactInfo[], startX: number, endX: number): ReactInfo[] {
  return reacts.map((item) => {
    let start = item.x;
    let end = item.x + item.width;
    let newStart = start;
    let newEnd = end;
    if (start < startX) {
      // 超出左侧
      newStart = startX;
    } else if (end > endX) {
      // 超出右侧
      newEnd = endX;
    }
    return {
      ...item,
      x: newStart - startX, // 重新计算x坐标
      width: newEnd - newStart,
    };
  });
}

export function filterReact(reacts: ReactInfo[], startX: number, endX: number): ReactInfo[] {
  return reacts.filter((item) => {
    const start = item.x;
    const end = start + item.width;
    if (start >= startX && end <= endX) {
      // 在屏幕中
      return true;
    } else if (start <= startX && end >= startX) {
      // 左侧部分超出屏幕
      return true;
    } else if (start <= endX && end >= endX) {
      // 右侧部分超出屏幕
      return true;
    }
    return false;
  });
}

// 判断react是否严格在tone词中
export function isReactInTone(react: ReactInfo, tone: LyricToneModel) {
  const { beginTime, duration } = tone;
  // CURSOR_AREA_WIDTH 油漆区偏移
  const toneStartX = beginTime * SECOND_PX + CURSOR_AREA_WIDTH;
  const toneEndX = toneStartX + duration * SECOND_PX;
  const reactStartX = react.x;
  const reactEndX = react.x + react.width;
  return reactStartX >= toneStartX && reactEndX <= toneEndX;
}

// 间距小于一个react的宽度;
export function isClosedReact(pre: ReactInfo, next: ReactInfo): boolean {
  const distance = COLORING_REACT_TIME * SECOND_PX;
  const preEnd = pre.x + pre.width;
  const nextStart = next.x;
  return Math.abs(nextStart - preEnd) < distance;
}

// 获取击中的react信息 (根据时间)
export function getHitInfo(lyric: LyricModel, currentTime: number): LyricToneModel {
  let tarTone = null;
  for (let line of lyric.lines) {
    for (let tone of line.tones) {
      const begin = tone.beginTime;
      const end = begin + tone.duration;
      if (begin <= currentTime && end >= currentTime) {
        tarTone = tone;
        break;
      }
    }
    if (tarTone) {
      break;
    }
  }
  return tarTone as LyricToneModel;
}

// 获取一行的平均分
export function getLineScore(line: LyricLineModel): number {
  let arr: number[] = [];
  line.tones.forEach((item) => {
    arr.push(getAverage(item.scores));
  });
  return Math.floor(getAverage(arr));
}

// 分数是否命中
export function isHitScore(score: number): boolean {
  return score >= HIT_SCORE_THRESHOLD * FULL_MARK;
}

// 获取一行的文字
export function getLineWords(line: LyricLineModel): string {
  let str = "";
  for (let tone of line.tones) {
    str += tone.word;
  }
  return str;
}

// 获取combo名称
export function getComboName(score: number): EnumCombo | undefined {
  if (score >= 60 && score < 75) {
    return EnumCombo.fair;
  } else if (score >= 75 && score < 90) {
    return EnumCombo.good;
  } else if (score >= 90) {
    return EnumCombo.excellent;
  }
  return undefined;
}
