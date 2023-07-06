export default class VoicePitchChanger {
  offset: number;
  n: number;

  constructor() {
    this.offset = 0.0;
    this.n = 0.0;
  }

  handlePitch(stdPitch: number, voicePitch: number, stdMaxPitch: number) {
    if (voicePitch <= 0) {
      return 0;
    }

    this.n += 1.0;
    const gap = stdPitch - voicePitch;

    this.offset = (this.offset * (this.n - 1)) / this.n + gap / this.n;

    if (this.offset < 0) {
      this.offset = Math.max(this.offset, -1 * stdMaxPitch * 0.4);
    } else {
      this.offset = Math.min(this.offset, stdMaxPitch * 0.4);
    }

    if (Math.abs(voicePitch - stdPitch) < 1) {
      /** 差距过小，直接返回 **/
      return voicePitch;
    }

    switch (this.n) {
      case 1:
        return Math.min(voicePitch + 0.5 * this.offset, stdMaxPitch);
      case 2:
        return Math.min(voicePitch + 0.6 * this.offset, stdMaxPitch);
      case 3:
        return Math.min(voicePitch + 0.7 * this.offset, stdMaxPitch);
      case 4:
        return Math.min(voicePitch + 0.8 * this.offset, stdMaxPitch);
      case 5:
        return Math.min(voicePitch + 0.9 * this.offset, stdMaxPitch);
      default:
        return Math.min(voicePitch + this.offset, stdMaxPitch);
    }
  }

  reset() {
    this.offset = 0.0;
    this.n = 0.0;
  }
}
