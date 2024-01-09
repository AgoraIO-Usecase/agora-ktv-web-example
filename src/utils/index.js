import { LrcTime } from "../proto/proto"
const { VITE_AGORA_APP_ID } = import.meta.env || {}

// string to Uint8Array
export function stringToUint8Array(str) {
  const arr = [];
  for (let i = 0, j = str.length;i < j;++i) {
    arr.push(str.charCodeAt(i));
  }
  const tmpUint8Array = new Uint8Array(arr);
  return tmpUint8Array;
}

// Uint8Array to  string
export function Uint8ArrayToString(fileData) {
  let dataString = "";
  for (let i = 0;i < fileData.length;i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  return dataString;
}

// 是否主播
export function isHost(role) {
  return role === "host";
}


export function getMusicList(role) {
  return [
    {
      songCode: "6625526603433040",
      name: "遇见",
      singer: "孙燕姿",
      select: false,
    },
    {
      songCode: "6625526624816000",
      name: "不如跳舞",
      singer: "陈慧琳",
      select: false,
    },
  ];
}

export const PREFIX = "/vocal-solo/"


export const APP_INFO = [
  {
    appId: VITE_AGORA_APP_ID,
    type: "default"
  },
  {
    appId: "6bb480f77c6c458696eadb61dfc6fb76",
    type: "test"
  }
]


// 生成延迟后的AudioBuffer
export const genDelayAudioBuffer = (buffer, ms) => {
  var numChannels = buffer.numberOfChannels;
  var sampleRate = buffer.sampleRate;
  var duration = buffer.duration;

  const oldFrameCount = Math.floor(sampleRate * duration)
  const newFrameCount = Math.floor(sampleRate * (ms / 1000 + duration))

  // 创建新的audioBuffer数据
  const newAudioBuffer = new AudioContext().createBuffer(numChannels, newFrameCount, sampleRate);

  // 创建Float32的空间,作为copy数据的载体
  const anotherArray = new Float32Array(oldFrameCount);

  for (var ch = 0;ch < numChannels;ch++) {
    buffer.copyFromChannel(anotherArray, ch, 0);
    newAudioBuffer.copyToChannel(anotherArray, ch, Math.floor(ms / 1000 * sampleRate));
  }

  return newAudioBuffer
}


export async function setupSenderTransform(transceiver) {
  const isChrome =
    navigator.userAgent.indexOf("Firefox") === -1 &&
    navigator.userAgent.indexOf("Chrome") > -1;

  //@ts-ignore
  if (!transceiver || !isChrome || !window.ENABLE_ENCODED_TRANSFORM) {
    return;
  }
  const sender = transceiver.sender;

  const id = transceiver.sender.track?.id;
  if (!id) {
    return;
  }

  let streams;
  try {
    // @ts-ignore
    streams = sender.createEncodedStreams();
  } catch (e) {
    console.log(`cannot create encoded streams for track ${id}`);
    return;
  }
  const transformer = new TransformStream({
    transform: async (chunk, controller) => {
      controller.enqueue(chunk);
    },
  });

  streams.readable.pipeThrough(transformer).pipeTo(streams.writable);
}


export const encodeAudioMetadata = (data = {}) => {
  console.log("[encodeAudioMetadata] ", data)
  const buffer = LrcTime.encode(data).finish()
  return buffer
}

export const decodeAudioMetadata = (metadataBuffer) => {
  const decodeData = LrcTime.decode(metadataBuffer)
  console.log("[decodeAudioMetadata] ", decodeData)
  return decodeData
}



export const encodeStreamMsg = (data) => {
  console.log("stream-message send", data)
  return stringToUint8Array(JSON.stringify(data))
}

export const decodeStreamMsg = (data) => {
  return JSON.parse(Uint8ArrayToString(data))
}





// else if (this.role == 'audience') {
//   // 观众
//   // 使用 realPosition 
//   if (realPosition <= 0) {
//     return
//   }
//   if (!this.canPlay) {
//     return
//   }
//   realPosition = realPosition > 0 ? realPosition : 0
//   realPosition = realPosition - window.renderDelay
//   if (realPosition < (this.currentTime * 1000 - 1000)) {
//     console.log("[test] realPosition < 1000", this.currentTime, realPosition)
//     return
//   }
//   if (preSysTime && preRealPosition) {
//     let offsetTime = Math.abs(new Date().getTime() - preSysTime)
//     let offsetRealPosition = Math.abs(realPosition - preRealPosition)
//     if (Math.abs(offsetRealPosition - offsetTime) > 3000) {
//       console.log("[test] △  > 3000")
//       preSysTime = new Date().getTime()
//       preRealPosition = realPosition
//       return
//     }
//   }
//   if (intervalId) {
//     clearInterval(intervalId)
//     intervalId = null
//   }
//   preSysTime = new Date().getTime()
//   preRealPosition = realPosition
//   const finPosition = realPosition / 1000
//   // currentTime 只能增加不能减少
//   this.currentTime = finPosition > this.currentTime ? finPosition : this.currentTime
//   console.log("[test] this.currentTime1111", typeof this.currentTime, this.currentTime)
//   engine.setTime(this.currentTime);
//   intervalId = setInterval(() => {
//     if (!this.canPlay) {
//       clearInterval(intervalId)
//       intervalId = null
//       return
//     }
//     this.currentTime = Number((this.currentTime + 0.02).toFixed(2))
//     engine.setTime(this.currentTime);
//     console.log('[test] currentTime', typeof this.currentTime, this.currentTime)
//   }, 20)
// }
