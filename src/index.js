/* global createjs */

const BPM = 76.8

import csv2array from 'csv2array'
import App from './app.js'

window.__loader = {}

function isUtilRow(row) {

	for (let i = 1; i < row.length; i++) {
		if (row[i] != '') {
			return false
		}
	}

	return true
}

function toInt(value) {
	return parseInt(value) || '-'
}

function formatCutsTable(table) {

	table.splice(0, 1)
	let cuts = []

	table.forEach((row) => {
		if (isUtilRow(row)/* || row[17] == 'o'*/) return

		cuts.push({
			'name': row[0],
			'inPoint': toInt(row[1]),
			'outPoint': toInt(row[2]),
			'duration': toInt(row[3]),
			'actionStart': toInt(row[5]),
			'sync': row[6] == 'o',
			'setType': row[7],
			'member': {
				'sato': row[8] == 'o',
				'waga': row[10] == 'o',
				'kevin': row[11] == 'o',
				'towana': row[9] == 'o'
			},
			'description': row[12],
			'memo': row[13],
			'hs': row[14] == 'o',
			'extra': row[15] == 'o',
			'still': row[16] == 'o',
			'skip': row[17] == 'o',
			'mute': row[18] == 'o'
		})
	})

	return cuts

}

let loadCuts = $.ajax({
	url: './data/cuts.csv',
	success: (data) => {
		let table = csv2array(data)
		window.__loader.cuts = formatCutsTable(table)
	}
})

function loadSound() {
	let d = $.Deferred()

	let sounds = {
		path: './data/',
		manifest: [
			{id: 'track', src: {mp3: 'track.mp3'}},
			{id: 'click', src: {mp3: 'click.mp3'}}
		]
	}

	createjs.Sound.alternateExtensions = ['mp3']
	createjs.Sound.addEventListener('fileload', onFileload)
	createjs.Sound.registerSounds(sounds)

	function onFileload() {
		window.__loader.track = createjs.Sound.createInstance('track')
		d.resolve()
	}

	return d.promise()

}

$.when(loadCuts, loadSound()).done(() => {

	console.log('aa')
	new App()
})
