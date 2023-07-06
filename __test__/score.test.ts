import { xml } from "./data/index";
import { assert, expect, test } from "vitest";
import Engine from "../src/engine/index";
import { getLyricData } from "./utils/index";

test("calc lines score", async () => {
  const res = await getLyricData();
  const engine = new Engine();
  await engine.setLyric(res);
  const lines = engine.lyric.lines.slice(0, 5);
  const lastLine = lines[lines.length - 1];
  const endTime = lastLine.beginTime + lastLine.duration;
  for (let line of lines) {
    for (let tone of line.tones) {
      let time = tone.beginTime + tone.duration / 2;
      engine.setTime(time);
      engine.setPitch(tone.pitch - 1);
    }
  }
  engine.setTime(endTime);
  let total = 0;
  let totalArr: number[] = [];
  for (let line of lines) {
    total += line.score;
    totalArr.push(line.score);
  }
  expect(lines).toMatchSnapshot();
  expect(total).toMatchInlineSnapshot("499");
  expect(totalArr).toMatchInlineSnapshot(`
    [
      99,
      100,
      100,
      100,
      100,
    ]
  `);
});
