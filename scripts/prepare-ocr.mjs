import { mkdir, copyFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
const dest = "public/ocr";
await mkdir(`${dest}/core`, { recursive: true });
await mkdir(`${dest}/lang`, { recursive: true });
const engine = dirname(require.resolve("tesseract.js/package.json"));
const core = dirname(require.resolve("tesseract.js-core/package.json"));
await copyFile(join(engine, "dist/worker.min.js"), `${dest}/worker.min.js`);
for (const file of await readdir(core))
  if (file.endsWith(".wasm.js") || file.endsWith(".wasm"))
    await copyFile(join(core, file), `${dest}/core/${file}`);
for (const lang of ["spa", "eng"]) {
  const pkg = dirname(
    require.resolve(`@tesseract.js-data/${lang}/package.json`),
  );
  await copyFile(
    join(pkg, "4.0.0", `${lang}.traineddata.gz`),
    `${dest}/lang/${lang}.traineddata.gz`,
  );
}
console.log("OCR local preparado: motor y modelos español/inglés.");

await copyFile(join(engine, "LICENSE.md"), `${dest}/LICENSE-tesseract.txt`);
await copyFile(join(core, "LICENSE"), `${dest}/LICENSE-core.txt`);

await copyFile(
  join(engine, "dist/worker.min.js.LICENSE.txt"),
  `${dest}/worker.min.js.LICENSE.txt`,
);
