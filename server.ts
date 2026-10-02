/**
 * @license
 * Mehsic Full-Stack Server
 * Express backend with mounted Vite middlewares in development.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CompositeMusicProvider } from './src/providers/CompositeMusicProvider.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  const provider = new CompositeMusicProvider();

  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', name: 'Mehsic Server', version: '1.0.0' });
  });

  app.get('/api/search', async (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const filter = (req.query.filter as 'all' | 'songs' | 'albums' | 'artists') || 'all';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;

    try {
      const results = await provider.search(q, { filter, limit });
      res.json(results);
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Search query failed' });
    }
  });

  app.get('/api/song/:id', async (req: Request, res: Response) => {
    try {
      const song = await provider.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: 'Song not found' });
      res.json(song);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve song' });
    }
  });

  app.get('/api/album/:id', async (req: Request, res: Response) => {
    try {
      const album = await provider.getAlbum(req.params.id);
      if (!album) return res.status(404).json({ error: 'Album not found' });
      res.json(album);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve album' });
    }
  });

  app.get('/api/artist/:id', async (req: Request, res: Response) => {
    try {
      const artist = await provider.getArtist(req.params.id);
      if (!artist) return res.status(404).json({ error: 'Artist not found' });
      res.json(artist);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve artist' });
    }
  });

  app.get('/api/stream/:id', async (req: Request, res: Response) => {
    const quality = (req.query.quality as string) || 'auto';
    try {
      const song = await provider.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: 'Song not found' });

      const stream = await provider.getStream(song, quality);
      if (!stream) return res.status(404).json({ error: 'Stream not available for this song' });

      res.json(stream);
    } catch (err) {
      res.status(500).json({ error: 'Failed to resolve stream' });
    }
  });

  app.get('/api/lyrics/:id', async (req: Request, res: Response) => {
    try {
      const song = await provider.getSong(req.params.id);
      if (!song) return res.status(404).json({ error: 'Song not found' });

      const lyrics = await provider.getLyrics(song);
      res.json({ lyrics: lyrics || [] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve lyrics' });
    }
  });

  // Frontend Serving
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development: mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mehsic Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
