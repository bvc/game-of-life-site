var gulp = require("gulp"),
  browserSync = require("browser-sync"),
  browserify = require("browserify"),
  del = require("del"),
  gutil = require("gulp-util"),
  mocha = require("gulp-mocha"),
  notify = require("gulp-notify"),
  rename = require("gulp-rename"),
  runSequence = require("run-sequence"),
  sass = require("gulp-sass"),
  swig = require("gulp-swig"),
  source = require("vinyl-source-stream"),
  sourcemaps = require("gulp-sourcemaps"),
  buffer = require("vinyl-buffer"),
  uglify = require("gulp-uglify"),
  jscs = require("gulp-jscs"),
  jshint = require("gulp-jshint"),
  args = require("yargs").argv,
  taskListing = require("gulp-task-listing");

var config = {
  port: {
    dev: 3000,
    ui: 3001
  },
  bundles: {
    app: "app.bundle.min.js"
  },
  src: {
    app: "./src/scripts/app.js",
    scripts: "./src/scripts/**/*.js",
    styles: "./src/styles/**/*.scss",
    images: "./src/images/**/*.{png,jpg}",
    templates: "./src/templates/**/*.swig.html",
    partials: "!./src/templates/**/_*.swig.html"
  },
  vendor: {
    styles: "./node_modules/bootstrap/dist/css/*.min.css",
    fonts: "./node_modules/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}"
  },
  dist: {
    root: "./dist/",
    scripts: "./dist/assets/js/",
    styles: "./dist/assets/css/",
    images: "./dist/assets/images/",
    fonts: "./dist/assets/fonts/"
  },
  tests: "./tests/**/*.js"
};

function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        gutil.log(gutil.colors.cyan(msg[item]));
      }
    }
  } else {
    gutil.log(gutil.colors.cyan(msg));
  }
}

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);

  // Keep gulp stopping
  this.emit("end");
}

function clean(path, done) {
  log("Cleaning: " + path);
  del(path, done);
}

gulp.task("clean", function (cb) {
  clean(config.dist.root, cb);
});

gulp.task("tests", function () {
  return gulp.src(config.tests)
    .pipe(mocha({ reporter: "list" }));
});

gulp.task("analyze", function() {
  log("Analyzing source with JSHint and JSCS");

  return gulp
    .src(config.src.scripts)
    .on("error", handleErrors)
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish", {verbose: true}))
    .pipe(jshint.reporter("fail"));
});

gulp.task("images", function () {
  return gulp.src(config.src.images)
    .pipe(gulp.dest(config.dist.images));
});

gulp.task("styles", ["styles:bootstrap", "styles:bootstrap-fonts"], function () {
  return gulp.src(config.src.styles)
    .pipe(sass({
      outputStyle: "compressed",
      onError: console.error.bind(console, "Sass error:")
    }))
    .pipe(gulp.dest(config.dist.styles));
});

gulp.task("styles:bootstrap", function () {
  return gulp.src(config.vendor.styles)
    .pipe(gulp.dest(config.dist.styles));
});

gulp.task("styles:bootstrap-fonts", function () {
  return gulp.src(config.vendor.fonts)
    .pipe(gulp.dest(config.dist.fonts));
});

gulp.task("scripts", function () {
  var bundler = browserify({
    entries: [config.src.app],
    debug: true
  });

  var bundle = function () {
    return bundler
      .bundle()
      .on("error", handleErrors)
      .pipe(source(config.bundles.app))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest(config.dist.scripts));
  };

  return bundle();
});

gulp.task("templates", function () {
  return gulp.src([config.src.templates, config.src.partials])
    .pipe(swig({
      defaults: {
        cache: false
      }
    }))
    .on("error", gutil.log)
    .pipe(rename(function (path) {
      path.basename = path.basename.replace(".swig", "");
    }))
    .pipe(gulp.dest(config.dist.root));
});

gulp.task("serve", function () {
  log("Starting browser sync");

  var files = [
    config.dist.scripts + "**/*.js",
    config.dist.styles + "**/*.css",
    config.dist.root + "**/*.html"
  ];

  var options = {
    port: config.port.dev,
    files: files,
    server: {
      baseDir: config.dist.root
    },
    ui: {
      port: config.port.ui
    }
  };

  browserSync.init(options);
});

gulp.task("watch", ["styles", "scripts", "templates", "images", "serve"], function () {
  gulp.watch(config.src.styles, ["styles"]);
  gulp.watch(config.src.scripts, ["analyze", "scripts"]);
  gulp.watch(config.src.templates, ["templates"]);
  gulp.watch(config.src.images, ["images"]);
});

gulp.task("build", function (cb) {
  runSequence(
    "clean",
    "styles",
    "scripts",
    "images",
    "templates",
    cb
  );
});

gulp.task("help", taskListing);
gulp.task("default", ["help"]);
