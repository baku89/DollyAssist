/* global process */

const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const webpack = require('webpack')
const WebpackStream = require('webpack-stream')
const BrowserSync = require('browser-sync')
const browserSync = BrowserSync.create()

let developmentMode = true

process.env.NODE_ENV = 'dev'

/*function requireUncached($module) {
	delete require.cache[require.resolve($module)]
	return require($module)
}*/

//==================================================
gulp.task('webpack', () => {
	let config = require('./webpack.config.js')

	// modify conig
	if (developmentMode) {
		config.devtool = 'inline-source-map'
		config.watch = true
	} else {
		config.plugins.push(
			new webpack.optimize.UglifyJsPlugin(),
			new webpack.optimize.DedupePlugin()
		)
	}

	return gulp.src('')
		.pipe($.plumber())
		.pipe(WebpackStream(config))
		.pipe(gulp.dest('public/js'))
    .pipe(browserSync.stream())
})

//==================================================

gulp.task('jade', () => {
	return gulp.src('./src/*.jade')
		.pipe($.plumber())
		// .pipe($.data(() => {
		// 	return requireUncached('./src/jade/data.json')
		// }))
		// .pipe($.shell(['node ./add-relations-to-works.js']))
		.pipe($.jade({pretty: developmentMode}))
		.pipe(gulp.dest('public'))
		.pipe(browserSync.stream())
})

//==================================================
gulp.task('stylus', () => {
	return gulp.src('./src/style.styl')
		.pipe($.plumber())
		.pipe($.stylus({use: [require('nib')()]}))
		.pipe($.autoprefixer())
		.pipe($.if(!developmentMode, $.combineMq()))
		.pipe($.if(!developmentMode, $.minifyCss()))
		.pipe(gulp.dest('public'))
		.pipe(browserSync.stream())
})


//==================================================
gulp.task('browser-sync', () => {
	browserSync.init({
		server: {
			baseDir: './public'
		},
		open: false
	})
})

//==================================================
gulp.task('watch', () => {
	gulp.watch('./src/**/*.styl', ['stylus'])
	gulp.watch(['./src/*.jade', './src/jade/*'], ['jade'])
})

//==================================================

gulp.task('default', ['webpack', 'jade', 'stylus', 'watch', 'browser-sync'])
