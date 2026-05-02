#!/usr/bin/env node
/**
 * Bulk Scenario Importer
 * ======================
 * Reads a CSV file of speaking-coach prompts and uploads each row
 * to the Firestore "scenarios" collection using the Firebase Admin SDK.
 *
 * Usage:
 *   1. Install dependencies:
 *        npm install firebase-admin csv-parser
 *
 *   2. Download your Firebase service-account key from:
 *        Firebase Console → Project Settings → Service accounts → Generate new private key
 *      Save it as  serviceAccountKey.json  next to this script (never commit it!).
 *
 *   3. Run:
 *        node import-scenarios.js
 *      or supply a custom CSV path:
 *        node import-scenarios.js path/to/scenarios.csv
 *
 * CSV columns (header row required):
 *   scenario  – scenario name, e.g. "restaurant"
 *   level     – CEFR level:  A1 | A2 | B1 | B2 | C1 | C2
 *   role      – "system" (AI prompt) or "student" (sample answer)
 *   prompt    – the text of the prompt or sample answer
 */

import admin from 'firebase-admin';
import csv from 'csv-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_FILE = process.argv[2] ?? path.join(__dirname, 'scenarios.csv');
const KEY_FILE = path.join(__dirname, 'serviceAccountKey.json');
const BATCH_SIZE = 400; // Firestore allows up to 500 ops per batch; 400 gives a comfortable safety margin
const VALID_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const VALID_ROLES = new Set(['system', 'student']);

// ── Firebase init ────────────────────────────────────────────────────────────
if (!fs.existsSync(KEY_FILE)) {
  console.error(`\n✗ Service account key not found at ${KEY_FILE}`);
  console.error(
    '  Download it from Firebase Console → Project Settings → Service accounts.\n',
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync(KEY_FILE, 'utf8')),
  ),
});
const db = admin.firestore();

// ── Read CSV and batch-import ────────────────────────────────────────────────
const rows = [];

fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    const { scenario, level, role, prompt } = row;
    const normalizedScenario = scenario?.trim();
    const normalizedLevel = level?.trim().toUpperCase();
    const normalizedRole = role?.trim().toLowerCase();
    const normalizedPrompt = prompt?.trim();

    if (
      !normalizedScenario ||
      !normalizedLevel ||
      !normalizedRole ||
      !normalizedPrompt
    ) {
      console.warn('⚠ Skipping incomplete row:', row);
      return;
    }
    if (!VALID_LEVELS.has(normalizedLevel)) {
      console.warn(
        `⚠ Skipping row with unknown level "${normalizedLevel}":`,
        row,
      );
      return;
    }
    if (!VALID_ROLES.has(normalizedRole)) {
      console.warn(
        `⚠ Skipping row with unknown role "${normalizedRole}":`,
        row,
      );
      return;
    }

    rows.push({
      scenario: normalizedScenario,
      level: normalizedLevel,
      role: normalizedRole,
      prompt: normalizedPrompt,
    });
  })
  .on('end', async () => {
    if (!rows.length) {
      console.error(
        '✗ No valid rows found in CSV. Check your file and column headers.',
      );
      process.exit(1);
    }

    console.log(`✔ CSV loaded — ${rows.length} valid rows. Starting import…`);

    // Commit in batches
    let total = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = rows.slice(i, i + BATCH_SIZE);
      chunk.forEach((r) => batch.set(db.collection('scenarios').doc(), r));
      await batch.commit();
      total += chunk.length;
      console.log(`  … ${total}/${rows.length} uploaded`);
    }
    console.log(`\n✅ Import complete. ${total} scenarios added to Firestore.`);
    process.exit(0);
  })
  .on('error', (err) => {
    console.error('✗ Error reading CSV:', err.message);
    process.exit(1);
  });
