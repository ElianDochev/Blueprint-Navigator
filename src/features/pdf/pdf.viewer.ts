import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export interface RenderResult {
  totalPages: number;
}

export async function renderImagePage(blob: Blob, zoom: number, canvas: HTMLCanvasElement): Promise<RenderResult> {
  const url = URL.createObjectURL(blob);
  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render image file."));
    };
    image.src = url;
  });

  const context = canvas.getContext("2d");
  if (!context) {
    URL.revokeObjectURL(url);
    throw new Error("Canvas 2D context is unavailable.");
  }

  canvas.width = Math.floor(image.width * zoom);
  canvas.height = Math.floor(image.height * zoom);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(url);
  return { totalPages: 1 };
}

export async function renderPdfPage(
  blob: Blob,
  pageNumber: number,
  zoom: number,
  canvas: HTMLCanvasElement
): Promise<RenderResult> {
  const bytes = await blob.arrayBuffer();
  const pdfTask = getDocument({ data: bytes });
  const pdf = await pdfTask.promise;

  const safePageNumber = Math.min(Math.max(pageNumber, 1), pdf.numPages);
  const page = await pdf.getPage(safePageNumber);
  const viewport = page.getViewport({ scale: zoom });

  const context = canvas.getContext("2d");
  if (!context) {
    await pdf.destroy();
    throw new Error("Canvas 2D context is unavailable.");
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  await pdf.destroy();

  return { totalPages: pdf.numPages };
}
