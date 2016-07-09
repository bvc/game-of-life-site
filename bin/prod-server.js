import browserSync from 'browser-sync';

browserSync({
  port: 3000,
  ui: {
    port: 3001
  },
  server: {
    baseDir: 'dist'
  },
  files: [
    'src/*.html'
  ]
});
