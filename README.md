# Smart AI Speaking Coach — Firebase Starter Template

A ready-to-go Firebase web app for building a smart, AI-driven speaking persona system.
Copy the repo, add your Firebase config, and you have a fully functional multi-user speaking coach.

<p>
  <img src="https://img.shields.io/badge/Firebase-9.x-orange?style=flat-square&colorA=564341&colorB=EDED91" alt="Firebase 9" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
</p>

---

## Features

| Area                  | What's included                                                                |
| --------------------- | ------------------------------------------------------------------------------ |
| **Auth**              | Google sign-in via Firebase Auth; role separation (Student / Coach)            |
| **Scenario Bank**     | Firestore `scenarios` collection; supports 2 000+ prompts with indexed lookups |
| **Progress Tracking** | Per-user Firestore `progress` doc; CEFR level (A1→C2) and scenario selection   |
| **History**           | Firestore `history` collection with real-time `onSnapshot` reads               |
| **AI Correction**     | In-browser heuristic feedback engine (drop-in replaceable with OpenAI/Gemini)  |
| **TTS**               | Web Speech API (`SpeechSynthesisUtterance`) — no external service needed       |
| **Audio Recording**   | `MediaRecorder` API with Firebase Storage upload                               |
| **Coach Portal**      | Add / delete scenario prompts directly from the browser                        |
| **Security Rules**    | Strict Firestore rules; scenario writes require an `admin` custom claim        |
| **Bulk Import**       | Node.js + CSV script to seed thousands of prompts in one command               |

---

## Quick Start

### 1 — Clone and open `index.html`

```bash
git clone <this-repo>
cd <repo-folder>
```

### 2 — Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** → Google sign-in method.
3. Enable **Firestore Database** (start in production mode).
4. Enable **Storage** (default rules are fine to start).

### 3 — Add your Firebase config

Open `index.html` and replace the placeholder `firebaseConfig` block near the top of the `<script>` tag:

```js
const firebaseConfig = {
  apiKey: 'YOUR-API-KEY',
  authDomain: 'YOUR-PROJECT.firebaseapp.com',
  projectId: 'YOUR-PROJECT-ID',
  storageBucket: 'YOUR-PROJECT.appspot.com',
  appId: 'YOUR-APP-ID',
};
```

### 4 — Deploy Firestore security rules

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools
firebase login

# Deploy rules from this repo
firebase deploy --only firestore:rules
```

The rules file is [`firestore.rules`](./firestore.rules).

### 5 — Open in browser

```bash
# Serve with any static server, e.g.:
npx serve .
# or just open index.html directly — no bundler required.
```

---

## Bulk-Importing Scenarios

A sample CSV (`scripts/scenarios.csv`) with 60+ starter prompts across six scenarios
(restaurant, hotel, airport, job interview, shopping, doctor, bank) is included.

To import your own 2 000+ prompts:

```bash
cd scripts

# Install one-time dependencies
npm install firebase-admin csv-parser

# Place your service-account key here (never commit it!)
# Download from: Firebase Console → Project Settings → Service accounts
cp ~/Downloads/serviceAccountKey.json .

# Run the importer (default: scripts/scenarios.csv)
node import-scenarios.js

# Or supply a custom CSV path:
node import-scenarios.js path/to/my-prompts.csv
```

**CSV column format:**

| Column     | Values                                            |
| ---------- | ------------------------------------------------- |
| `scenario` | free text, e.g. `restaurant`                      |
| `level`    | `A1` `A2` `B1` `B2` `C1` `C2`                     |
| `role`     | `system` (AI prompt) or `student` (sample answer) |
| `prompt`   | the prompt text                                   |

---

## Assigning the Coach / Admin Role

Scenario writes are restricted to users with the Firebase custom claim `admin: true`.
Set this server-side using the Firebase Admin SDK:

```js
// Run once, server-side (Node.js)
const admin = require('firebase-admin');
admin.initializeApp({
  /* service account config */
});

await admin.auth().setCustomUserClaims('<COACH_UID>', { admin: true });
console.log('Coach role assigned.');
```

After the claim is set the coach must sign out and back in for it to take effect.

---

## Replacing the AI Engine

The `analyzeResponse()` function in `index.html` is a simple heuristic.
To use a real LLM, replace it with an API call:

```js
async function analyzeResponse(reply, prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${YOUR_OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a strict English speaking coach. ' +
            'Reply with JSON: { "passed": true/false, "message": "...", "tip": "..." }',
        },
        {
          role: 'user',
          content: `Prompt: "${prompt}"\nStudent reply: "${reply}"`,
        },
      ],
    }),
  });
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}
```

> **Security note:** Never expose an API key in a client-side script that is
> publicly accessible. Route AI calls through a Firebase Cloud Function or a
> secure backend.

---

## Using the Rsbuild Plugin (optional)

If you use [Rsbuild](https://rsbuild.dev/) as your bundler, the included plugin
injects your Firebase config at build time and warns about placeholder values:

```bash
npm add rsbuild-plugin-firebase-speaking-coach -D
```

```ts
// rsbuild.config.ts
import { pluginFirebaseSpeakingCoach } from './src';

export default {
  plugins: [
    pluginFirebaseSpeakingCoach({
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY!,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.FIREBASE_PROJECT_ID!,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
        appId: process.env.FIREBASE_APP_ID!,
      },
    }),
  ],
};
```

---

## Firestore Data Model

```
scenarios/{docId}
  scenario : string   // e.g. "restaurant"
  level    : string   // A1 | A2 | B1 | B2 | C1 | C2
  role     : string   // "system" | "student"
  prompt   : string

progress/{userId}
  uid           : string
  scenario      : string
  level         : string
  progress      : Array<{ promptId, passed, reply, audioUrl, ts }>
  correctStreak : number

history/{docId}
  uid      : string
  scenario : string
  level    : string
  prompt   : string
  reply    : string
  passed   : boolean
  audioUrl : string | null
  ts       : Timestamp
```

---

## License

[MIT](./LICENSE)
