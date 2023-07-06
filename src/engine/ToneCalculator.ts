class ToneCalculator {
  // default value:
  // scoreLevel 10
  // scoreCompensationOffset 0
  calcScore(voicePitch: number, stdPitch: number, scoreLevel: number, scoreCompensationOffset: number): number {
    const stdTone = this.pitchToTone(stdPitch);
    const voiceTone = this.pitchToTone(voicePitch);
    let match = 1 - (scoreLevel / 100) * Math.abs(voiceTone - stdTone) + scoreCompensationOffset / 100;
    match = Math.max(0, match);
    match = Math.min(1, match);
    return match * 100;
  }

  pitchToTone(pitch: number): number {
    const eps = 1e-6;
    return Math.max(0, Math.log(pitch / 55 + eps) / Math.log(2)) * 12;
  }
}

export default ToneCalculator;
