class AudioBufferManager {

  constructor(url) {
    this.url = url
    this.arrayBuffers = []
    this.audioBuffers = []
    this.audioTrack = null
    this.intervalIds = []
  }

  async deal() {
    const buffer = await this.load()
    const byteLength = buffer.byteLength
    const numParts = 10;
    const chunkSize = Math.ceil(byteLength / numParts);
    for (let i = 0;i < numParts;i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, byteLength);
      const chunk = buffer.slice(start, end);
      this.arrayBuffers.push(chunk);
    }

    console.log("this.arrayBuffers", this.arrayBuffers)
    var audioContext1 = new AudioContext();
    const audioBuffer1 = await audioContext1.decodeAudioData(this.arrayBuffers[0])

    var audioContext2 = new AudioContext();
    const audioBuffer2 = await audioContext2.decodeAudioData(this.arrayBuffers[1])

    this.audioBuffers.push(audioBuffer1)
    this.audioBuffers.push(audioBuffer2)
  }

  async createTrack() {
    const audioBuffer = this.audioBuffers.shift()
    this.audioTrack = await AgoraRTC.createBufferSourceAudioTrack({
      source: audioBuffer,
    });
    console.log("this.audioTrack", this.audioTrack)
    this.audioTrack.on("ended", () => {
      console.log("this.audioTrack end")
    })
  }

  play() {
    this.audioTrack.play();
    this.audioTrack.startProcessAudioBuffer();
    const duration = this.audioTrack.duration
    const intervalId = setInterval(() => {
      const curTime = this.audioTrack.getCurrentTime()
      if (curTime > duration - 3) {

        clearInterval(intervalId)
        return
      }
    }, 1000)
    this.intervalIds.push(intervalId)
    // getCurrentTime
  }

  async load() {
    const buffer = await fetch(this.url)
      .then((response) => response.arrayBuffer())
    // .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));
    return buffer;
  }


  destory(){
    this.audioTrack.stop()
    this.audioTrack.close()
    this.audioTrack = null
    this.intervalIds.forEach(id => {
      clearInterval(id)
    })
  }

}



export default AudioBufferManager
