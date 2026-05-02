import type { RsbuildPlugin } from '@rsbuild/core';

/** Firebase project configuration passed to the plugin. */
export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  appId: string;
  /** Optional — only needed when using Firebase Analytics. */
  measurementId?: string;
};

export type PluginFirebaseSpeakingCoachOptions = {
  /**
   * Firebase project configuration object.
   * Required fields: apiKey, authDomain, projectId, storageBucket, appId.
   *
   * @example
   * ```ts
   * firebaseConfig: {
   *   apiKey: "AIza...",
   *   authDomain: "my-project.firebaseapp.com",
   *   projectId: "my-project",
   *   storageBucket: "my-project.appspot.com",
   *   appId: "1:123:web:abc"
   * }
   * ```
   */
  firebaseConfig?: FirebaseConfig;

  /**
   * Name of the global JS constant that will receive the serialised Firebase
   * config so that `index.html` can read it at runtime.
   *
   * @default "__FIREBASE_CONFIG__"
   */
  globalConstantName?: string;
};

/**
 * Rsbuild plugin for the Smart AI Speaking Coach Firebase starter template.
 *
 * What it does
 * ------------
 * 1. Validates the supplied Firebase config at build time and warns about
 *    placeholder values that still need to be replaced.
 * 2. Injects the config into the build as a global constant so the app can
 *    read it without hard-coding credentials in source files.
 *
 * Quick start
 * -----------
 * ```ts
 * // rsbuild.config.ts
 * import { pluginFirebaseSpeakingCoach } from './src';
 *
 * export default {
 *   plugins: [
 *     pluginFirebaseSpeakingCoach({
 *       firebaseConfig: {
 *         apiKey:        process.env.FIREBASE_API_KEY!,
 *         authDomain:    process.env.FIREBASE_AUTH_DOMAIN!,
 *         projectId:     process.env.FIREBASE_PROJECT_ID!,
 *         storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
 *         appId:         process.env.FIREBASE_APP_ID!,
 *       },
 *     }),
 *   ],
 * };
 * ```
 */
export const pluginFirebaseSpeakingCoach = (
  options: PluginFirebaseSpeakingCoachOptions = {},
): RsbuildPlugin => ({
  name: 'plugin-firebase-speaking-coach',

  setup(api) {
    const { firebaseConfig, globalConstantName = '__FIREBASE_CONFIG__' } =
      options;

    // ── Build-time validation ──────────────────────────────────────────────
    api.onBeforeBuild(() => {
      if (!firebaseConfig) {
        console.warn(
          '[plugin-firebase-speaking-coach] No firebaseConfig provided. ' +
            'The app will fall back to the placeholder config in index.html.',
        );
        return;
      }

      const placeholderPattern = /^YOUR-/;
      const requiredKeys: (keyof FirebaseConfig)[] = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'appId',
      ];

      const issues: string[] = [];
      for (const key of requiredKeys) {
        const val = firebaseConfig[key];
        if (!val || placeholderPattern.test(val)) {
          issues.push(
            `  • ${key}: "${val ?? '(missing)'}" looks like a placeholder`,
          );
        }
      }
      if (issues.length) {
        console.warn(
          '[plugin-firebase-speaking-coach] ⚠  Firebase config has unset fields:\n' +
            issues.join('\n') +
            '\n  Replace these with your real Firebase project values.',
        );
      }
    });

    // ── Inject config as a global constant ────────────────────────────────
    if (firebaseConfig) {
      api.modifyRsbuildConfig((config) => {
        config.source ??= {};
        config.source.define ??= {};
        (config.source.define as Record<string, string>)[globalConstantName] =
          JSON.stringify(firebaseConfig);
        return config;
      });
    }
  },
});

// ── Backwards-compatible alias ─────────────────────────────────────────────
export { pluginFirebaseSpeakingCoach as pluginExample };
export type { PluginFirebaseSpeakingCoachOptions as PluginExampleOptions };
