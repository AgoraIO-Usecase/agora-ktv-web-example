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
      songCode: "6625526605291650",
      name: "十年",
      singer: "陈奕迅",
      select: false,
    },
    {
      songCode: "6625526603528200",
      name: "七里香",
      singer: "周杰伦",
      select: false,
    },
    {
      songCode: "6654550269701680",
      name: "告白气球",
      singer: "周杰伦",
      select: false,
    },
    {
      songCode: "6625526603296890",
      name: "晴天",
      singer: "周杰伦",
      select: false,
    },
    {
      songCode: "6625526603301530",
      name: "成都",
      singer: "赵雷",
      select: false,
    },
    {
      songCode: "6625526603287770",
      name: "纸短情长",
      singer: "花粥",
      select: false,
    },
  ];
}

export const PREFIX = "/chorus/"


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
