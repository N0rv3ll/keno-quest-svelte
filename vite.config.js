// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-netlify';

export default defineConfig({
  plugins: [sveltekit()],
	kit: {
    adapter: adapter({
      // if true, will create a Netlify Edge Function rather
      // than using standard Node.js serverless functions
      edge: false,

      // if true, will split your app into multiple functions
      // instead of creating a single one for the entire app.
      // if `edge` is true, this option cannot be used
      split: false
    })
  }
});