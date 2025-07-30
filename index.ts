/*BroadcateR rewrote in TypeScript */

/* Software beneath is wrote with help of Github Copilot as i'm new to TypeScript :) */
/* You're free to modify, fork, commit, add functionality and profit of it as long as you mention my github Lukseh or my website Lukseh.org */

import fs_p from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import JSON5 from 'json5';
import express, { Request, Response, NextFunction } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { renderBroadcastPage, renderMainDashboard } from './renderer.js';
import { Instance, GSISnapshot, AuthRequest } from './types.js';

/* Constants and Environment */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT: number = Number(process.env.PORT) || 8740;
const BASE_PATH: string = (process.env.BASE_PATH || '/broadcast').replace(/\/+$/, '');
const AUTH_KEY: string = process.env.AUTH_KEY || 'super-secret-key';

/* Instance Configuration */
const instanceRaw: string = await fs_p.readFile(path.join(__dirname, '..', 'instances.json5'), 'utf8');
const { instances = [] }: { instances: Instance[] } = JSON5.parse(instanceRaw);

/* Express Setup */
const app = express();
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.json());

/* Enhanced Authentication Middleware */
function protect(req: AuthRequest, res: Response, next: NextFunction): void {
  const key = req.get('x-auth-key') || 
              req.query.key as string || 
              req.body?.auth?.token;
  
  if (key === AUTH_KEY) {
    return next();
  }
  
  console.warn(`Unauthorized access attempt from ${req.ip} at ${new Date().toISOString()}`);
  res.status(401).json({ 
    error: 'unauthorized',
    message: 'Valid API key required',
    timestamp: new Date().toISOString()
  });
}

/* History Buffer with Improved Types */
const history: Record<string, GSISnapshot[]> = Object.create(null);

/* Helper: Purge old items to prevent memory leaks */
function purgeOld(arr: GSISnapshot[], delayMs: number): void {
  const limit = Date.now() - delayMs * 3;
  while (arr.length && arr[0].ts < limit) {
    arr.shift();
  }
}

/* WebSocket Management */
const wss = new WebSocketServer({ noServer: true });
const wsClients: Record<string, Set<WebSocket>> = Object.create(null);

/* Broadcast delayed GSI data to WebSocket clients */
function broadcastDelayedGSI(instanceId: string, delayMs: number): void {
  const clients = wsClients[instanceId];
  if (!clients) return;

  const snapshots = history[instanceId] || [];
  const cutoff = Date.now() - delayMs;
  
  // Find the most recent snapshot that's old enough (past the delay)
  let delayedSnapshot: any = null;
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (snapshots[i].ts <= cutoff) {
      delayedSnapshot = snapshots[i].data;
      break;
    }
  }

  if (!delayedSnapshot) return;

  // Remove auth data before broadcasting
  const cleanData = { ...delayedSnapshot };
  if (cleanData.auth) delete cleanData.auth;

  // Broadcast to all connected clients
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(cleanData));
      } catch (error) {
        console.error(`WebSocket send error for instance ${instanceId}:`, error);
      }
    }
  }
}

/* Main Dashboard Route */
app.get('/', (req: Request, res: Response) => {
  res.type('html').send(renderMainDashboard(instances));
});

/* Route Setup for Each Instance */
for (const instance of instances) {
  // Normalize instance properties
  instance.url = `/${String(instance.url || instance.id)}`.replace(/\/+/g, '/');
  instance.delay_ms = Number(instance.delay_ms) || 8000; // Default 8 seconds

  const overlayRoute = BASE_PATH + instance.url;
  const gsiRoute = '/gsi' + instance.url;
  const wsRoute = '/ws' + instance.url;

  // Broadcast page route
  app.get(overlayRoute, (req: Request, res: Response) => {
    res.type('html').send(renderBroadcastPage(instance, instances));
  });

  // GET: Retrieve delayed GSI snapshot (public, no auth needed)
  app.get(gsiRoute, (req: Request, res: Response) => {
    const snapshots = history[instance.id] || [];
    const cutoff = Date.now() - instance.delay_ms!;
    
    let delayedSnapshot: any = null;
    for (let i = snapshots.length - 1; i >= 0; i--) {
      if (snapshots[i].ts <= cutoff) {
        delayedSnapshot = snapshots[i].data;
        break;
      }
    }

    // Always remove auth data from response
    if (delayedSnapshot && delayedSnapshot.auth) {
      delayedSnapshot = { ...delayedSnapshot };
      delete delayedSnapshot.auth;
    }

    res.json(delayedSnapshot || {});
  });

  // POST: Store new GSI data (requires authentication)
  app.post(gsiRoute, protect, (req: AuthRequest, res: Response) => {
    const snapshots = history[instance.id] ||= [];
    
    // Clean the data before storing (never store auth keys)
    const cleanData = { ...req.body };
    if (cleanData.auth) delete cleanData.auth;
    
    const snapshot: GSISnapshot = {
      ts: Date.now(),
      data: cleanData
    };
    
    snapshots.push(snapshot);
    purgeOld(snapshots, instance.delay_ms!);
    
    // Broadcast the delayed snapshot to WebSocket clients
    broadcastDelayedGSI(instance.id, instance.delay_ms!);
    
    res.json({ 
      ok: true, 
      stored: snapshots.length,
      instance: instance.id,
      delay_ms: instance.delay_ms,
      timestamp: snapshot.ts
    });
  });

  // WebSocket upgrade placeholder
  app.get(wsRoute, (req: Request, res: Response) => {
    res.status(426).json({
      error: 'Upgrade Required',
      message: 'This endpoint requires WebSocket upgrade'
    });
  });

  console.log(`Instance: ${instance.id}`);
  console.log(`  Broadcast: GET  ${overlayRoute}`);
  console.log(`  GSI:       GET  ${gsiRoute} (delayed by ${instance.delay_ms}ms)`);
  console.log(`  GSI:       POST ${gsiRoute} (auth required)`);
  console.log(`  WebSocket:      ${wsRoute}`);
}

/* HTTP Server with WebSocket Upgrade */
const server = http.createServer(app);

server.on('upgrade', (req, socket, head): void => {
  const url = req.url;
  if (!url) {
    socket.destroy();
    return;
  }
  
  const matchedInstance = instances.find(inst => `/ws${inst.url}` === url);
  if (!matchedInstance) {
    socket.destroy();
    return;
  }
  
  const instanceId = matchedInstance.id;
  
  wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
    // Initialize client set if needed
    if (!wsClients[instanceId]) {
      wsClients[instanceId] = new Set();
    }
    
    wsClients[instanceId].add(ws);
    console.log(`WebSocket connected to instance ${instanceId}`);
    
    ws.on('close', () => {
      wsClients[instanceId]?.delete(ws);
      console.log(`WebSocket disconnected from instance ${instanceId}`);
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for instance ${instanceId}:`, error);
      wsClients[instanceId]?.delete(ws);
    });
  });
});

/* Start Server */
server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 BroadcasteR.ts Server Started`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔐 Auth: ${AUTH_KEY ? '[CONFIGURED]' : '[WARNING: DEFAULT KEY]'}`);
  console.log(`📂 Base Path: ${BASE_PATH}`);
  console.log(`📊 Instances: ${instances.length}`);
  console.log(`=================================`);
});

/* 404 Handler */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});