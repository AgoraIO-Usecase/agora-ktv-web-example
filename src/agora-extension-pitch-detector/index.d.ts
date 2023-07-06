import { AudioExtension } from 'agora-rte-extension';
import { AudioProcessor } from 'agora-rte-extension';
import type { IAudioExtension } from 'agora-rte-extension';
import type { IAudioProcessor } from 'agora-rte-extension';

/** @public */
export declare interface IPitchDetectorExtension extends IAudioExtension<IPitchDetectorProcessor> {
    checkCompatibility(): boolean;
}

/** @public */
export declare interface IPitchDetectorProcessor extends IAudioProcessor {
    setInterval(interval: number): Promise<void>;
    destroy(): Promise<void>;
    on(event: "pitchInfo", listener: (info: PitchInformation) => void): void;
}

/** @public */
export declare class PitchDetectorExtension extends AudioExtension<PitchDetectorProcessor> implements IPitchDetectorExtension {
    constructor(options: PitchDetectorExtensionOptions);
    checkCompatibility(): boolean;
}

/** @public */
export declare type PitchDetectorExtensionOptions = {
    assetsPath: string;
    fetchOptions?: RequestInit;
};

/** @public */
export declare class PitchDetectorProcessor extends AudioProcessor implements IPitchDetectorProcessor {
    readonly name: string;
    setInterval(interval: number): Promise<void>;
    destroy(): Promise<void>;
}

/** @public */
export declare type PitchInformation = {
    voicePitch: number;
};

export { }
