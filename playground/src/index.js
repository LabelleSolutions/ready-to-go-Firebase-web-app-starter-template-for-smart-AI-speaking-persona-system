/**
 * Playground entry point
 * ──────────────────────
 * Demonstrates the plugin by rendering a simple setup guide inside the
 * Rsbuild playground page.  The actual Firebase web app lives in index.html
 * at the repository root — open it directly in a browser after filling in
 * your Firebase config.
 */
import './index.css';

document.querySelector('#root').innerHTML = `
<div class="content">
  <h1>🎙️ Smart AI Speaking Coach</h1>
  <p>Firebase starter template — see <code>index.html</code> to run the full app.</p>
  <p>
    Replace the <code>firebaseConfig</code> in <code>index.html</code>,
    deploy to Firebase Hosting, and you're ready to go.
  </p>
</div>
`;
