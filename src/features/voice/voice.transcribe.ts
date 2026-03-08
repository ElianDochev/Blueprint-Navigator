interface WhisperResponse {
  text?: string;
}

export async function transcribeWithWhisper(audioBlob: Blob): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_OPENAI_WHISPER_MODEL as string | undefined) || "whisper-1";

  if (!apiKey) {
    throw new Error("Voice transcription requires VITE_OPENAI_API_KEY.");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "voice-input.webm");
  formData.append("model", model);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error("Whisper transcription request failed.");
  }

  const body = (await response.json()) as WhisperResponse;
  return typeof body.text === "string" ? body.text : "";
}
