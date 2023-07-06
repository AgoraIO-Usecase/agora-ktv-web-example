import VoicePitchChanger from "../src/engine/VoicePitchChanger";
import { assert, expect, test } from "vitest";

test("voice pitch", () => {
  let changer = new VoicePitchChanger();
  expect(changer.handlePitch(0, 0, 400)).toBe(0);
  expect(changer.handlePitch(1, 0, 400)).toBe(0);
  expect(changer.handlePitch(1, 1, 400)).toBe(1);
  expect(changer.handlePitch(100, 90, 400)).toBe(93);
  expect(changer.handlePitch(100, 80, 400)).toBe(87);
  expect(changer.handlePitch(200, 80, 400)).toBe(110);
  expect(changer.handlePitch(400, 80, 400)).toBe(164.60000000000002);
  expect(changer.handlePitch(400, 200, 400)).toBe(311.66666666666663);
  expect(changer.handlePitch(400, 400, 400)).toBe(400);
  expect(changer.handlePitch(400, 500, 400)).toBe(400);
  expect(changer.handlePitch(400, 600, 400)).toBe(400);
});
