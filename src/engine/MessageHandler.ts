import { stringToUint8Array, Uint8ArrayToString } from "../utils/index";
import { Message, EnumMessage } from "./type";

export class MessageHandler {
  private _sequence: number;
  private _songIndex: number = 0;

  constructor() {
    this._sequence = 0;
    this._songIndex = -1;
  }

  handlerMessage(uid: string | number, data: object) {
    const detail = JSON.parse(Uint8ArrayToString(data)) as Message;
    const { type, songIndex } = detail;
    if (type == EnumMessage.order) {
      if (songIndex && songIndex != this._songIndex) {
        this._songIndex = songIndex;
        return detail;
      } else {
        return {};
      }
    }
    return detail;
  }

  genMessage(obj: Message) {
    let msg = {
      ...obj,
      sequence: this._sequence++,
    } as Message;
    // console.log("msg", msg);
    return stringToUint8Array(JSON.stringify(msg));
  }
}
