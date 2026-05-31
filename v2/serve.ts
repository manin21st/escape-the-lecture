const PORT = Number(process.env.PORT ?? 5075);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    try {
      const url = new URL(req.url);
      let pathname = url.pathname;
      if (pathname === '/') pathname = '/index.html';

      const filePath = `./dist${pathname}`;
      const file = Bun.file(filePath);
      const exists = await file.exists();
      if (!exists) return new Response('Not Found', { status: 404 });

      const ext = pathname.slice(pathname.lastIndexOf('.'));
      const contentType = MIME[ext] ?? 'application/octet-stream';

      return new Response(file, {
        headers: { 'Content-Type': contentType },
      });
    } catch {
      return new Response('Bad Request', { status: 400 });
    }
  },
});

console.log(`escape-the-lecture-v2 serving on port ${PORT}`);
