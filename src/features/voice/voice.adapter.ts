import { useEffect, useMemo, useRef, useState } from "react";
import { transcribeWithWhisper } from "./voice.transcribe";

export interface VoiceAdapterState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

function stopMediaStream(stream: MediaStream | null) {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
}

export function useVoiceAdapter(
  onTranscript: (transcript: string) => void,
  onError?: (message: string) => void
): VoiceAdapterState {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const supported = useMemo(() => {
    return typeof window !== "undefined" && !!window.navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
  }, []);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      recorderRef.current = null;
      chunksRef.current = [];
    };
  }, []);

  async function start() {
    if (!supported) {
      throw new Error("Voice recording is unavailable in this browser.");
    }

    if (listening) {
      return;
    }

    const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    chunksRef.current = [];
    streamRef.current = stream;
    recorderRef.current = recorder;
    setTranscript("");

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      chunksRef.current = [];
      stopMediaStream(streamRef.current);
      streamRef.current = null;

      if (blob.size === 0) {
        return;
      }

      void (async () => {
        try {
          const nextTranscript = (await transcribeWithWhisper(blob)).trim();
          setTranscript(nextTranscript);
          if (nextTranscript) {
            onTranscript(nextTranscript);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to transcribe voice input.";
          onError?.(message);
        }
      })();
    };

    recorder.onerror = () => {
      onError?.("Voice recording failed.");
    };

    recorder.start();
    setListening(true);
  }

  async function stop() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setListening(false);
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      return;
    }

    recorder.stop();
    setListening(false);
  }

  return {
    supported,
    listening,
    transcript,
    start,
    stop
  };
}
