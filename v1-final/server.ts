import { join } from "path";

const ROOT = import.meta.dir;
const PORT = 5096;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(join(ROOT, path));
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`escape-the-lecture running on port ${PORT}`);
