import './index.css';
import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject();

document.querySelector('#root').innerHTML = `
<div class="content">
  <h1>Vanilla Rsbuild</h1>
  <p>Start building amazing things with Rsbuild.</p>
</div>
`;
