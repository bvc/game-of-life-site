import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback';

browserSync({
  port: 4002,
  ui: {
    port: 4003
  },
  server: {
    baseDir: 'dist'
  },
  files: [
    'src/*.html'
  ],
  middleware: [
    historyApiFallback()
  ]
});
