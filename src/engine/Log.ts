export enum EnumLogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export default class Log {
  level: EnumLogLevel;

  constructor() {
    this.level = EnumLogLevel.ERROR;
  }

  // -------- private methods --------
  private _log(...args: any[]) {
    console.log(...args);
  }

  private _err(...args: any[]) {
    let res = "";
    for (let item of args) {
      res += typeof item == "string" ? item : JSON.stringify(item);
    }
    console.error(res);
  }

  //  ----------- public methods -----------
  setLevel(level: EnumLogLevel) {
    if (typeof level != "number" || !(level <= 3 && level >= 0)) {
      throw Error("Invalid level");
    } else {
      this.level = level;
    }
  }

  debug(...args: any[]) {
    this.level <= EnumLogLevel.DEBUG && this._log(`${new Date()}[ENGINE-DEBUG]: `, ...args);
  }

  info(...args: any[]) {
    this.level <= EnumLogLevel.INFO && this._log(`${new Date()}[ENGINE-DEBUG]: `, ...args);
  }

  warn(...args: any[]) {
    this.level <= EnumLogLevel.WARN && this._log(`${new Date()}[ENGINE-DEBUG]: `, ...args);
  }

  error(...args: any[]) {
    this.level <= EnumLogLevel.ERROR && this._err(`${new Date()}[ENGINE-DEBUG]: `, ...args);
  }
}
