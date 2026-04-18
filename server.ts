import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { BigQuery } from '@google-cloud/bigquery';
import { DataplexServiceClient } from '@google-cloud/dataplex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for GCP Clients
const getBigQuery = (credentials?: string) => {
  const options = credentials ? { credentials: JSON.parse(credentials) } : {};
  return new BigQuery(options);
};

const getDataplex = (credentials?: string) => {
  const options = credentials ? { credentials: JSON.parse(credentials) } : {};
  return new DataplexServiceClient(options);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('--- DataMind Backend Initialization ---');
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
    console.warn('⚠️ WARNING: No GCP credentials found. System will operate in MOCK MODE.');
    console.warn('To enable real GCP connectivity, provide GOOGLE_APPLICATION_CREDENTIALS or set service account JSON in Settings.');
  } else {
    console.log('✅ GCP Infrastructure detected. Ready for BigQuery/Dataplex operations.');
  }

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // DQ Rules Management
  app.get('/api/rules', async (req, res) => {
    // This would fetch from Firestore if set up
    res.json([
      { id: '1', name: 'Null Check Email', dimension: 'completeness', status: 'active' },
      { id: '2', name: 'Range Check Amount', dimension: 'validity', status: 'active' }
    ]);
  });

  app.post('/api/rules', async (req, res) => {
    const newRule = req.body;
    console.log('Saving new rule:', newRule);
    res.status(201).json({ id: Math.random().toString(36).substr(2, 9), ...newRule });
  });

  app.get('/api/gcp/projects', async (req, res) => {
    try {
      // Falling back to a demo project if listing is not supported/configured
      // Usually requires high level permissions anyway
      res.json([
        { id: process.env.GOOGLE_CLOUD_PROJECT || 'data-governance-prod', name: 'Production Data Project' }
      ]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.json([
        { id: 'demo-project', name: 'Demo Project (GCP Mock)' }
      ]);
    }
  });

  app.get('/api/gcp/datasets/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const bq = new BigQuery({ projectId });
      const [datasets] = await bq.getDatasets();
      res.json(datasets.map(d => ({
        id: d.id,
        name: d.id
      })));
    } catch (error) {
      res.json([
        { id: 'raw_data', name: 'Raw Data (Mock)' },
        { id: 'analytics_marts', name: 'Analytics Marts (Mock)' }
      ]);
    }
  });

  app.get('/api/gcp/tables/:projectId/:datasetId', async (req, res) => {
    try {
      const { projectId, datasetId } = req.params;
      const bq = new BigQuery({ projectId });
      const dataset = bq.dataset(datasetId);
      const [tables] = await dataset.getTables();
      res.json(tables.map(t => ({
        id: t.id,
        name: t.id
      })));
    } catch (error) {
      res.json([
        { id: 'users', name: 'Users (Mock)' },
        { id: 'orders', name: 'Orders (Mock)' }
      ]);
    }
  });

  // Dataplex DQ Scans Proxy
  app.post('/api/scans/run', async (req, res) => {
    const { tableId, ruleId } = req.body;
    console.log(`Running Dataplex scan for ${tableId} with rule ${ruleId}`);
    // Real call: dataplex.createDataQualityScan()
    res.json({ scanId: 'scan-xyz-123', status: 'queued' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
