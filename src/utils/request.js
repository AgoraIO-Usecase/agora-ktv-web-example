// http request
import axios from "axios";

let { VITE_AGORA_AUTHORIZATION, VITE_AGORA_APP_ID } = import.meta.env;
const DEFAULT_REQUEST_ID = "4135901d9c8b4f0cb09fbb51fd7508dd";
const Authorization = `Basic ${VITE_AGORA_AUTHORIZATION}`;
const songMap = new Map();
const appId = window?.appInfo?.appId || ""

// const prefix = 'http://218.205.37.50:16000'
const prefix = 'https://service-staging.agora.io/toolbox/openapi'
// const prefix = "https://api.agora.io"

let token = ""
let taskId = ""

// songCode 请求回来的MP4地址每次不一样 (做一层缓存)
// 注意MP4地址的有效期
export async function apiGetSongDetail({ requestId = DEFAULT_REQUEST_ID, songCode }) {
  try {
    if (songMap.has(songCode)) {
      return songMap.get(songCode);
    }
    const res = await axios.get(
      `https://api.agora.io/cn/v1.0/projects/${appId}/ktv-service/api/serv/song-url?requestId=${requestId}&songCode=${songCode}&lyricType=0&extTag=1`,
      { headers: { Authorization: Authorization } }
    );
    if (res.status == 200) {
      const data = res?.data?.data || {};
      songMap.set(songCode, data);
      return data;
    } else {
      return Promise.reject(res);
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function apiGetLyric(url = "") {
  const res = await axios({
    method: "get",
    url: url,
    responseType: "arraybuffer",
  });
  if (res.status === 200 || res.status === 0) {
    return res.data;
  } else {
    return Promise.reject(res);
  }
}

export async function apiBuildToken() {
  try {
    const res = await axios.post(
      `${prefix}/v1/projects/${appId}/rtsc/cloud-transcoder/builderTokens`,
      {
        instanceId: new Date().getTime().toString(),
        testIp: "218.205.37.50"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: Authorization
        }
      },
    );
    token = res.data.tokenName
    return res.data;
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function apiStartConfluence(channel) {
  try {
    const url = `${prefix}/v1/projects/${appId}/rtsc/cloud-transcoder/tasks?builderToken=${token}`
    const data = {
      services: {
        cloudTranscoder: {
          serviceType: "cloudTranscoderV2",
          config: {
            "transcoder": {
              "audioInputs": [{
                "rtc": {
                  "rtcUid": 0,
                  "rtcToken": VITE_AGORA_APP_ID,
                  "rtcChannel": channel
                }
              }], "idleTimeout": 30,
              "outputs": [{
                "audioOption": {
                  "profileType": "AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO",
                  "fullChannelMixer": "native-mixer-weighted"
                },
                "rtc": {
                  "rtcUid": 9527,
                  "rtcToken": VITE_AGORA_APP_ID,
                  "rtcChannel": channel + "_ad"
                },
                "dataStreamOption": {
                  "source": {
                    "dataStream": true,
                  },
                  "sink": {}
                },
                "metaDataOption": {
                  "source": {
                    "audioMetaData": true,
                  },
                  "sink": {}
                }
              }]
            }
          }
        }
      }
    }
    const res = await axios.post(url, data, {
      "Content-Type": "application/json",
      Authorization: Authorization
    })
    taskId = res.data.taskId
    return res.data
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function apiStopConfluence() {
  if (!token || !taskId) {
    return
  }

  try {
    const url = `${prefix}/v1/projects/${appId}/rtsc/cloud-transcoder/tasks/${taskId}?builderToken=${token}`
    const res = await fetch(url, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: Authorization,
      }
    })
    token = ""
    taskId = ""
    return res.data
  } catch (err) {
    return Promise.reject(err);
  }
}
