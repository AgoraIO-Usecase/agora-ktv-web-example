import { assert, expect, test } from "vitest";
import Engine from "../src/engine/index";
import { getLyricData } from "./utils/index";

test("calc cursor", async () => {
  const res = await getLyricData();
  const engine = new Engine();
  const cursorData: any[] = [];
  engine.on("cursor", (data) => {
    cursorData.push(data);
  });
  await engine.setLyric(res);
  expect(engine.pitchMin).toMatchInlineSnapshot("0");
  expect(engine.pitchMax).toMatchInlineSnapshot("436");
  expect(engine.pitchHeight).toMatchInlineSnapshot("436");

  engine.setPitch(0); // null
  engine.setPitch(-1); // null
  engine.setPitch(436); // max
  engine.setPitch(437); // max
  engine.setPitch(100);
  engine.setPitch(200);
  engine.setPitch(300);

  expect(cursorData).toMatchInlineSnapshot(`
    [
      {
        "x": 100,
        "y": 60,
      },
      {
        "x": 100,
        "y": 60,
      },
      {
        "x": 100,
        "y": 13.761467889908257,
      },
      {
        "x": 100,
        "y": 27.522935779816514,
      },
      {
        "x": 100,
        "y": 41.28440366972477,
      },
    ]
  `);
});
