import { ReactInfo } from "../src/engine/type";
import { assert, expect, test } from "vitest";
import { filterReact, cutOffReact, isClosedReact } from "../src/engine/utils";
import { CURSOR_AREA_WIDTH } from "../src/engine/const";

const coloringReactInfo1: ReactInfo[] = [
  {
    x: 242.3466666666667,
    y: 33.71559633027523,
    width: 0.5,
  },
  {
    x: 242.8800000000001,
    y: 33.71559633027523,
    width: 0.5,
  },
  {
    x: 243.89333333333298,
    y: 33.71559633027523,
    width: 0.5,
  },
  {
    x: 244.3199999999996,
    y: 33.71559633027523,
    width: 0.37999999999961176,
  },
  {
    x: 245.91999999999985,
    y: 34.678899082568805,
    width: 0.4499999999998394,
  },
  {
    x: 246.34666666666647,
    y: 33.440366972477065,
    width: 0.5,
  },
  {
    x: 248.29333333333295,
    y: 33.30275229357798,
    width: 0.5,
  },
  {
    x: 248.29333333333295,
    y: 33.30275229357798,
    width: 0.5,
  },
  {
    x: 248.90666666666675,
    y: 33.30275229357798,
    width: 0.5,
  },
  {
    x: 250.87999999999965,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 251.35999999999967,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 251.8933333333331,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 252.3199999999997,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 252.90666666666652,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 253.33333333333314,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 259.3599999999998,
    y: 32.20183486238532,
    width: 0.14999999999979252,
  },
  {
    x: 261.8933333333331,
    y: 31.788990825688074,
    width: 0.5,
  },
  {
    x: 262.3466666666667,
    y: 31.788990825688074,
    width: 0.5,
  },
  {
    x: 263.81333333333316,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 264.3199999999996,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 264.9066666666664,
    y: 31.926605504587158,
    width: 0.09666666666642953,
  },
  {
    x: 265.78666666666663,
    y: 31.51376146788991,
    width: 0.5,
  },
  {
    x: 266.29333333333307,
    y: 31.51376146788991,
    width: 0.5,
  },
  {
    x: 267.3599999999999,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 268.29333333333295,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 268.87999999999977,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 269.8933333333332,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 270.34666666666624,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 279.3599999999998,
    y: 31.651376146788987,
    width: 0.2999999999997982,
  },
  {
    x: 286.29333333333307,
    y: 32.33944954128441,
    width: 0.5,
  },
  {
    x: 292.9066666666665,
    y: 33.02752293577982,
    width: 0.5,
  },
  {
    x: 293.33333333333314,
    y: 33.02752293577982,
    width: 0.5,
  },
  {
    x: 293.893333333333,
    y: 33.02752293577982,
    width: 0.5,
  },
  {
    x: 294.3466666666666,
    y: 33.02752293577982,
    width: 0.5,
  },
  {
    x: 294.88,
    y: 33.02752293577982,
    width: 0.5,
  },
  {
    x: 295.36,
    y: 33.02752293577982,
    width: 0.020000000000024443,
  },
  {
    x: 296.26666666666665,
    y: 32.477064220183486,
    width: 0.5,
  },
  {
    x: 296.26666666666665,
    y: 32.477064220183486,
    width: 0.5,
  },
  {
    x: 312.9066666666665,
    y: 44.31192660550459,
    width: 0.5,
  },
  {
    x: 313.33333333333314,
    y: 44.31192660550459,
    width: 0.5,
  },
  {
    x: 316.8533333333329,
    y: 44.31192660550459,
    width: 0.5,
  },
  {
    x: 342.3466666666667,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 342.8800000000001,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 343.893333333333,
    y: 33.30275229357798,
    width: 0.5,
  },
  {
    x: 344.7466666666668,
    y: 33.30275229357798,
    width: 0.5,
  },
  {
    x: 345.33333333333303,
    y: 33.30275229357798,
    width: 0.24333333333302676,
  },
  {
    x: 346.29333333333307,
    y: 33.440366972477065,
    width: 0.5,
  },
  {
    x: 355.36,
    y: 32.20183486238532,
    width: 0.5,
  },
  {
    x: 371.8933333333331,
    y: 31.51376146788991,
    width: 0.5,
  },
  {
    x: 377.91999999999973,
    y: 28.48623853211009,
    width: 0.5,
  },
  {
    x: 378.34666666666635,
    y: 28.48623853211009,
    width: 0.5,
  },
  {
    x: 378.87999999999977,
    y: 28.48623853211009,
    width: 0.15999999999976922,
  },
  {
    x: 380.3199999999998,
    y: 30.825688073394495,
    width: 0.07999999999981355,
  },
  {
    x: 380.90666666666664,
    y: 30.963302752293576,
    width: 0.5,
  },
  {
    x: 381.7599999999999,
    y: 30.963302752293576,
    width: 0.5,
  },
  {
    x: 382.3466666666667,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 382.8800000000001,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 403.35999999999956,
    y: 31.788990825688074,
    width: 0.5,
  },
  {
    x: 403.893333333333,
    y: 31.788990825688074,
    width: 0.5,
  },
  {
    x: 404.3199999999996,
    y: 31.788990825688074,
    width: 0.5,
  },
  {
    x: 404.9066666666664,
    y: 31.788990825688074,
    width: 0.2466666666663997,
  },
  {
    x: 411.8933333333331,
    y: 35.22935779816514,
    width: 0.5,
  },
  {
    x: 412.74666666666633,
    y: 35.22935779816514,
    width: 0.5,
  },
  {
    x: 413.91999999999996,
    y: 35.22935779816514,
    width: 0.5,
  },
  {
    x: 414.3466666666666,
    y: 35.22935779816514,
    width: 0.016666666666580454,
  },
  {
    x: 414.88,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 415.36,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 415.89333333333343,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 416.32000000000005,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 416.9066666666663,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 417.3333333333329,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 418.29333333333295,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 418.29333333333295,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 419.3599999999998,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 420.3199999999998,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 420.90666666666664,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 421.33333333333326,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 421.8933333333331,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 422.3466666666667,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 422.8800000000001,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 423.35999999999956,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 423.893333333333,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 442.3466666666667,
    y: 31.51376146788991,
    width: 0.5,
  },
  {
    x: 442.8800000000001,
    y: 31.51376146788991,
    width: 0.5,
  },
  {
    x: 443.35999999999956,
    y: 31.51376146788991,
    width: 0.5,
  },
  {
    x: 443.893333333333,
    y: 31.51376146788991,
    width: 0.5,
  },
  {
    x: 444.9066666666664,
    y: 31.51376146788991,
    width: 0.08666666666641731,
  },
  {
    x: 445.33333333333303,
    y: 30.963302752293576,
    width: 0.5,
  },
  {
    x: 451.8666666666667,
    y: 33.1651376146789,
    width: 0.4366666666666674,
  },
  {
    x: 452.3199999999997,
    y: 25.183486238532108,
    width: 0.5,
  },
  {
    x: 454.3466666666666,
    y: 25.183486238532108,
    width: 0.5,
  },
  {
    x: 454.88,
    y: 25.183486238532108,
    width: 0.3899999999999437,
  },
  {
    x: 455.36,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 465.33333333333303,
    y: 28.89908256880734,
    width: 0.5,
  },
  {
    x: 466.29333333333307,
    y: 28.89908256880734,
    width: 0.5,
  },
  {
    x: 466.8799999999999,
    y: 28.89908256880734,
    width: 0.5,
  },
  {
    x: 468.74666666666656,
    y: 30,
    width: 0.5,
  },
  {
    x: 471.3599999999997,
    y: 30,
    width: 0.08999999999964814,
  },
  {
    x: 471.8666666666667,
    y: 30,
    width: 0.5,
  },
  {
    x: 472.3199999999997,
    y: 30,
    width: 0.5,
  },
  {
    x: 493.33333333333314,
    y: 21.880733944954127,
    width: 0.5,
  },
  {
    x: 493.91999999999996,
    y: 21.880733944954127,
    width: 0.5,
  },
  {
    x: 494.3466666666666,
    y: 21.880733944954127,
    width: 0.5,
  },
  {
    x: 494.88,
    y: 21.880733944954127,
    width: 0.5,
  },
  {
    x: 495.36,
    y: 21.880733944954127,
    width: 0.15999999999998238,
  },
  {
    x: 496.9066666666663,
    y: 26.8348623853211,
    width: 0.5,
  },
  {
    x: 497.3333333333329,
    y: 26.8348623853211,
    width: 0.5,
  },
];

const coloringReactInfo2: ReactInfo[] = [
  {
    x: 498.29333333333295,
    y: 26.8348623853211,
    width: 0.033333333332947745,
  },
  {
    x: 498.29333333333295,
    y: 26.8348623853211,
    width: 0.033333333332947745,
  },
  {
    x: 498.87999999999977,
    y: 27.522935779816514,
    width: 0.5,
  },
  {
    x: 500.74666666666644,
    y: 27.522935779816514,
    width: 0.5,
  },
  {
    x: 500.74666666666644,
    y: 27.522935779816514,
    width: 0.5,
  },
  {
    x: 501.33333333333326,
    y: 27.522935779816514,
    width: 0.02333333333325527,
  },
  {
    x: 501.9200000000001,
    y: 31.238532110091747,
    width: 0.5,
  },
  {
    x: 502.3466666666667,
    y: 31.238532110091747,
    width: 0.5,
  },
  {
    x: 506.8799999999999,
    y: 28.211009174311926,
    width: 0.5,
  },
  {
    x: 507.3599999999999,
    y: 28.211009174311926,
    width: 0.5,
  },
  {
    x: 519.8933333333332,
    y: 22.844036697247706,
    width: 0.5,
  },
  {
    x: 520.3199999999998,
    y: 22.844036697247706,
    width: 0.5,
  },
  {
    x: 521.3333333333333,
    y: 22.844036697247706,
    width: 0.5,
  },
  {
    x: 521.9200000000001,
    y: 22.844036697247706,
    width: 0.2300000000000324,
  },
  {
    x: 522.3466666666667,
    y: 26.69724770642202,
    width: 0.5,
  },
  {
    x: 522.8800000000001,
    y: 26.69724770642202,
    width: 0.5,
  },
  {
    x: 523.3599999999996,
    y: 26.69724770642202,
    width: 0.5,
  },
  {
    x: 524.9066666666664,
    y: 26.69724770642202,
    width: 0.16666666666637298,
  },
  {
    x: 525.333333333333,
    y: 28.34862385321101,
    width: 0.5,
  },
  {
    x: 529.3333333333334,
    y: 31.10091743119266,
    width: 0.5,
  },
  {
    x: 532.9066666666665,
    y: 31.10091743119266,
    width: 0.5,
  },
  {
    x: 533.3333333333331,
    y: 31.10091743119266,
    width: 0.5,
  },
  {
    x: 533.92,
    y: 31.10091743119266,
    width: 0.5,
  },
  {
    x: 536.9066666666663,
    y: 31.926605504587158,
    width: 0.5,
  },
  {
    x: 544.9066666666664,
    y: 29.724770642201836,
    width: 0.5,
  },
  {
    x: 548.7466666666666,
    y: 32.752293577981646,
    width: 0.5,
  },
  {
    x: 549.3333333333334,
    y: 32.752293577981646,
    width: 0.4033333333333644,
  },
  {
    x: 551.3599999999997,
    y: 21.055045871559635,
    width: 0.5,
  },
  {
    x: 551.8933333333331,
    y: 21.055045871559635,
    width: 0.5,
  },
  {
    x: 573.92,
    y: 30.963302752293576,
    width: 0.5,
  },
  {
    x: 574.3466666666666,
    y: 30.963302752293576,
    width: 0.5,
  },
  {
    x: 575.36,
    y: 30.963302752293576,
    width: 0.5,
  },
  {
    x: 586.2933333333331,
    y: 47.064220183486235,
    width: 0.5,
  },
  {
    x: 586.2933333333331,
    y: 47.064220183486235,
    width: 0.5,
  },
  {
    x: 600.7466666666664,
    y: 31.238532110091747,
    width: 0.5,
  },
  {
    x: 603.893333333333,
    y: 36.88073394495413,
    width: 0.5,
  },
  {
    x: 604.7466666666668,
    y: 36.88073394495413,
    width: 0.5,
  },
  {
    x: 604.7466666666668,
    y: 36.88073394495413,
    width: 0.5,
  },
  {
    x: 622.8800000000001,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 623.3599999999996,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 623.893333333333,
    y: 33.85321100917431,
    width: 0.5,
  },
  {
    x: 626.2933333333331,
    y: 36.05504587155963,
    width: 0.5,
  },
  {
    x: 626.8799999999999,
    y: 36.05504587155963,
    width: 0.5,
  },
  {
    x: 629.3333333333334,
    y: 36.05504587155963,
    width: 0.5,
  },
  {
    x: 631.8933333333331,
    y: 39.22018348623853,
    width: 0.5,
  },
  {
    x: 632.9066666666665,
    y: 39.22018348623853,
    width: 0.5,
  },
];

const coloringReactInfo3: ReactInfo[] = [
  {
    x: 157.60000000000002,
    y: 35.631768953068594,
    width: 0.5000000000000071,
  },
  {
    x: 158.53333333333336,
    y: 35.631768953068594,
    width: 0.5000000000000071,
  },
];

// 左边超出屏幕
test("select coloring react info from left", () => {
  const startX = 243;
  const endX = startX + CURSOR_AREA_WIDTH;
  let result = filterReact(coloringReactInfo1, startX, endX);
  result = cutOffReact(result, startX, endX);
  expect(result).toMatchSnapshot();
});

// 右边超出屏幕
test("select coloring react info from right", () => {
  const startX = 533;
  const endX = startX + CURSOR_AREA_WIDTH;
  let result = filterReact(coloringReactInfo2, startX, endX);
  result = cutOffReact(result, startX, endX);
  expect(result).toMatchSnapshot();
});

// react 之间的间距大于 react自身宽度
test("react spacing over", () => {
  for (let i = 0; i < coloringReactInfo3.length - 1; i++) {
    const pre = coloringReactInfo3[i];
    const next = coloringReactInfo3[i + 1];
    pre.x = Number(pre.x.toFixed(6));
    pre.width = Number(pre.width.toFixed(6));
    expect(isClosedReact(pre, next)).toBe(true);
  }
});
