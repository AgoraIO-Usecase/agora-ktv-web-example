import JSZip from "jszip";
import X2JS from "x2js"; // xml数据处理插件

export class Parser {
  parser: X2JS;

  constructor() {
    this.parser = new X2JS();
  }

  // 解析
  parserXml(xml: string) {
    return this.parser.xml2js(xml);
  }

  async unZip(data: ArrayBuffer) {
    try {
      const zip: any = await JSZip.loadAsync(data);
      const keys = Object.keys(zip.files);
      for (let key of keys) {
        const text = await zip.file(key).async("string");
        return text;
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
