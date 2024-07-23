import type * as SpeechRecognition from 'dom-speech-recognition';
import type VisRxWidget from '@/Vis/visRxWidget';

declare global {
    interface Window {
        webkitSpeechRecognition?: SpeechRecognition;
        adapterName: string;
        /** The vis-2 adapter instance */
        visAdapterInstance?: number;
        visRxWidget: typeof VisRxWidget;
        visConfigLoaded?: Promise<void>;
        sentryDSN?: string;
        disableDataReporting?: boolean;
    }
}
