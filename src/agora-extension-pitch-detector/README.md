# agora-extension-pitch-detector

This package provides voice pitch information for Agora Web SDK v4.10.0+.

## Install

```
yarn add -D agora-extension-pitch-detector
```

Then publish the wasm file under `node_modules/agora-extension-pitch-detector/` and pass the path to the extension instance.

## Usage

```
import { PitchDetectorExtension } from "agora-extension-pitch-detector";
import type { IPitchDetectorProcessor, PitchInformation } from "agora-extension-pitch-detector";

const extension = new PitchDetectorExtension({ assetsPath: "./" });
AgoraRTC.registerExtensions([extension]);

const track = AgoraRTC.createMicrophoneAudioTrack(),
if (extension.checkCompatibility()) {
  const processor = extension.createProcessor();
  try {
    track.pipe(processor).pipe(track.processorDestination);
    processor.setInterval(50);
  } catch (error) {
    console.error(error);
  }
  processor.on("pitchInfo", (info: PitchInformation) =>
    console.log(`voicePitch=${info.voicePitch}`)
  );
}
```
