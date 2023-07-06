import { apiGetLyric } from "../../src/utils/request.js";

let _dataMap = new Map();

const DEFAULT_URL = "https://accktv.sd-rtn.com/202304072151/734633a36da177df95c3a358677cb3e8/release/lyric/zip_utf8/3/251964.zip";

export const getLyricData = async (url: string = DEFAULT_URL) => {
  if (_dataMap.has(url)) {
    return _dataMap.get(url);
  }
  const res = await apiGetLyric(url);
  _dataMap.set(url, res);
  return res;
};
