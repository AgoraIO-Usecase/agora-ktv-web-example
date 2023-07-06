import { beforeAll, expect, test, beforeEach } from "vitest";
import Engine from "../src/engine/index";
import { getLyricData } from "./utils/index";

beforeAll(async () => {
  await getLyricData();
});

test("parse xml data", async () => {
  let res = await getLyricData();
  const engine = new Engine();
  await engine.setLyric(res);
  expect(engine.lyric).toMatchSnapshot();
});
