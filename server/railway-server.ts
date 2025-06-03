import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static audio files from public/sounds directory
app.use('/sounds', express.static(path.join(process.cwd(), 'public/sounds')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Basic static file serving for Railway deployment
  app.use(express.static('public'));
  
  // Simple catch-all for SPA routing
  app.get('*', (req, res) => {
    // For API routes, return 404
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For all other routes, serve a basic HTML page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rick and Morty Dating Simulator</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
              color: #00ff88;
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .container {
              max-width: 600px;
              padding: 40px;
              border: 2px solid #00ff88;
              border-radius: 15px;
              background: rgba(0, 0, 0, 0.8);
            }
            h1 { color: #00ff88; margin-bottom: 20px; }
            .status { color: #ffa500; margin: 20px 0; }
            .api-link { color: #00aaff; text-decoration: none; }
            .api-link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Rick and Morty Dating Simulator</h1>
            <div class="status">✅ Server is running successfully!</div>
            <p>The backend API is operational.</p>
            <p>Health check: <a href="/api/health" class="api-link">/api/health</a></p>
            <p>Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}</p>
            <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          </div>
        </body>
      </html>
    `);
  });

  // Use Railway's PORT environment variable or default to 5000
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Railway server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV}`);
    log(`Database URL configured: ${!!process.env.DATABASE_URL}`);
    log(`Health check endpoint: http://0.0.0.0:${port}/api/health`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
})();