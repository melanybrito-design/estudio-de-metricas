import type { OcrLine } from "../domain/screenshot";
export async function readScreenshot(
  file: File,
  onProgress: (value: number) => void,
  signal: AbortSignal,
): Promise<{ lines: OcrLine[]; text: string }> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Usa una captura PNG, JPG o WebP.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error(
      "La imagen supera 12 MB. Recorta la captura e inténtalo otra vez.",
    );
  const bitmap = await createImageBitmap(file);
  if (
    bitmap.width * bitmap.height > 24000000 ||
    bitmap.width < 100 ||
    bitmap.height < 100
  ) {
    bitmap.close();
    throw new Error("Usa una captura entre 100 píxeles y 24 megapíxeles.");
  }
  const scale = Math.min(2, 1800 / bitmap.width, 3600 / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("El navegador no permite procesar la imagen.");
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // Normalize dark-mode screenshots. The pixels never leave this browser.
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let sum = 0,
    count = 0;
  for (let i = 0; i < pixels.data.length; i += 80) {
    sum += (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
    count++;
  }
  if (sum / count < 115) {
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] = 255 - pixels.data[i];
      pixels.data[i + 1] = 255 - pixels.data[i + 1];
      pixels.data[i + 2] = 255 - pixels.data[i + 2];
    }
    ctx.putImageData(pixels, 0, 0);
  }
  let worker:
    | Awaited<ReturnType<(typeof import("tesseract.js"))["createWorker"]>>
    | undefined;
  let stopped = false;
  let abort: () => void = () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stoppedPromise = new Promise<never>((_, reject) => {
    abort = () => {
      stopped = true;
      reject(new Error("Lectura cancelada. Puedes probar otra captura."));
      void worker?.terminate();
    };
    signal.addEventListener("abort", abort, { once: true });
    timer = setTimeout(() => {
      stopped = true;
      reject(
        new Error(
          "La lectura tardó demasiado. Prueba una captura más pequeña.",
        ),
      );
      void worker?.terminate();
    }, 120000);
  });
  const task = (async () => {
    if (signal.aborted) throw new Error("Lectura cancelada.");
    const { createWorker, PSM } = await import("tesseract.js");
    worker = await createWorker(["spa", "eng"], 1, {
      workerPath: "/ocr/worker.min.js",
      corePath: "/ocr/core",
      langPath: "/ocr/lang",
      workerBlobURL: false,
      logger: (msg) => {
        if (!stopped)
          onProgress(
            msg.status === "recognizing text"
              ? 20 + Math.round(msg.progress * 80)
              : 10,
          );
      },
      errorHandler: () => {},
    });
    if (stopped || signal.aborted) {
      await worker.terminate();
      throw new Error("Lectura cancelada.");
    }
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });
    const { data } = await worker.recognize(
      canvas,
      {},
      { text: true, blocks: true },
    );
    const lines: OcrLine[] =
      data.blocks?.flatMap((b) =>
        b.paragraphs.flatMap((p) =>
          p.lines.map((l) => ({
            text: l.text,
            confidence: l.confidence,
            bbox: l.bbox,
          })),
        ),
      ) || [];
    return {
      text: data.text,
      lines: lines.length
        ? lines
        : data.text
            .split("\n")
            .map((text) => ({ text, confidence: data.confidence })),
    };
  })();
  try {
    return await Promise.race([task, stoppedPromise]);
  } finally {
    stopped = true;
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
    await worker?.terminate();
    canvas.width = 0;
    canvas.height = 0;
  }
}
