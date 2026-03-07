import { useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export interface VoiceAdapterState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function useVoiceAdapter(onTranscript: (transcript: string) => void): VoiceAdapterState {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript.trim()) {
      onTranscript(transcript.trim());
      resetTranscript();
    }
  }, [listening, transcript, onTranscript, resetTranscript]);

  async function start() {
    resetTranscript();
    await SpeechRecognition.startListening({ language: "en-US", continuous: false });
  }

  async function stop() {
    await SpeechRecognition.stopListening();
  }

  return {
    supported: browserSupportsSpeechRecognition,
    listening,
    transcript,
    start,
    stop
  };
}
