function concatenateBuffers(buffer1, buffer2) {
  const audioContext = new AudioContext()
  // 创建一个新的缓冲区，长度为两个源缓冲区的长度之和
  var newBuffer = audioContext.createBuffer(buffer1.numberOfChannels, buffer1.length + buffer2.length, buffer1.sampleRate);

  // 将buffer1的数据拷贝到新缓冲区的前半部分
  for (var channel = 0;channel < buffer1.numberOfChannels;channel++) {
    var buffer1Data = buffer1.getChannelData(channel);
    var newBufferData = newBuffer.getChannelData(channel);
    for (var i = 0;i < buffer1.length;i++) {
      newBufferData[i] = buffer1Data[i];
    }
  }

  // 将buffer2的数据拷贝到新缓冲区的后半部分
  for (var channel = 0;channel < buffer2.numberOfChannels;channel++) {
    var buffer2Data = buffer2.getChannelData(channel);
    var newBufferData = newBuffer.getChannelData(channel);
    for (var i = 0;i < buffer2.length;i++) {
      newBufferData[buffer1.length + i] = buffer2Data[i];
    }
  }

  return newBuffer;
}


class AudioBufferManager {

  constructor(url) {
    this.url = url
    this.arrayBuffers = []
    this.audioBuffers = []
    this.audioTrack = null
    this.nextAudioTrack = null
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

    const arrayBuffer1 = this.arrayBuffers.shift()
    var audioContext1 = new AudioContext();
    const audioBuffer1 = await audioContext1.decodeAudioData(arrayBuffer1)

    this.audioBuffers.push(audioBuffer1)

    const audioBuffer = this.audioBuffers.shift()
    this.audioTrack = await AgoraRTC.createBufferSourceAudioTrack({
      source: audioBuffer,
    });

  }


  play() {
    this.audioTrack.on("source-state-change", (state) => {
      console.log("this.audioTrack state changed: ", state);
      if (state == 'stopped') {
        this.audioTrack.close()
        this.audioTrack = null
        this.playNext()
      }
    })
    this.audioTrack.play();
    this.audioTrack.startProcessAudioBuffer();
    const duration = this.audioTrack.duration
    const intervalId = setInterval(async () => {
      const curTime = this.audioTrack.getCurrentTime()
      if (curTime > duration - 3) {
        const track = await this.prepareNext()
        this.nextAudioTrack = track
        clearInterval(intervalId)
        return
      }
    }, 1000)
    this.intervalIds.push(intervalId)
  }

  playNext() {
    this.nextAudioTrack.on("source-state-change", (state) => {
      console.log("this.audioTrack state changed: ", state);
      if (state == 'stopped') {
        this.nextAudioTrack.close()
        this.nextAudioTrack = null
        this.play()
      }
    })
    this.nextAudioTrack.play()
    this.nextAudioTrack.startProcessAudioBuffer();
    const duration = this.nextAudioTrack.duration
    const intervalId = setInterval(async () => {
      const curTime = this.nextAudioTrack.getCurrentTime()
      if (curTime > duration - 3) {
        const track = await this.prepareNext()
        this.audioTrack = track
        clearInterval(intervalId)
        return
      }
    }, 1000)
    this.intervalIds.push(intervalId)
  }

  async prepareNext() {
    if (!this.audioBuffers.length) {
      const arrayBuffer = this.arrayBuffers.shift()
      var audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const audioTrack = await AgoraRTC.createBufferSourceAudioTrack({
        source: audioBuffer,
      })
      return audioTrack
    }
  }

  async load() {
    const buffer = await fetch(this.url)
      .then((response) => response.arrayBuffer())
    // .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));
    return buffer;
  }


  destory() {
    this.audioTrack.stop()
    this.audioTrack.close()
    this.audioTrack = null
    this.intervalIds.forEach(id => {
      clearInterval(id)
    })
  }

}



export default AudioBufferManager
