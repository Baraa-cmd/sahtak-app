import express from 'express';
import {createServer as createViteServer} from 'vite';
import path from 'path';
import fs from 'fs';

async function startServer() {
  const app = express();
  const vite = await createViteServer({
    server: {middlewareMode: true},
    appType: 'spa',
  });

  app.use(express.json());

  // Serve static assets from public/ directory explicitly with correct MIME types
  app.use(express.static(path.join(process.cwd(), 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.apk')) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment');
      }
    }
  }));

  // Direct APK download route handler to prevent SPA fallback to index.html/apk.html
  app.get('/*.apk', (req, res, next) => {
    const filename = path.basename(req.path);
    const possiblePaths = [
      path.join(process.cwd(), 'public', filename),
      path.join(process.cwd(), 'public', 'Sahtak-Dierhafer-v1.1.apk'),
      path.join(process.cwd(), 'public', 'Sahtak-Dierhafer.apk'),
      path.join(process.cwd(), filename)
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.sendFile(p);
      }
    }
    next();
  });

  app.get('/api/download-apk', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const version = (req.query.version as string) || '1.1.0';
      let buffer: Buffer | null = null;

      if (targetUrl) {
        try {
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Sahtak-Dierhafer-App'
            },
            redirect: 'follow'
          });
          if (response.ok) {
            const arrayBuf = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuf);
          }
        } catch (e) {
          console.warn('Remote APK fetch failed, using fallback buffer:', e);
        }
      }

      if (!buffer || buffer.length < 100) {
        // Fallback to local APK file in public if available
        const localApkPath = path.join(process.cwd(), 'public', 'Sahtak-Dierhafer-v1.1.apk');
        if (fs.existsSync(localApkPath)) {
          buffer = fs.readFileSync(localApkPath);
        }
      }

      if (buffer) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', `attachment; filename="Sahtak-Dierhafer-v${version}.apk"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
      }

      res.status(404).send('APK File not found');
    } catch (err: any) {
      console.error('Download proxy error:', err);
      res.status(500).send(err.message || 'Server error');
    }
  });

  app.use(vite.middlewares);

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
