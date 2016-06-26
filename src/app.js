/* global createjs */
import 'jquery-touch-events'
import Mousetrap from 'mousetrap'
import 'jquery.transit'

const FPS = 24.0
const BPM = 70//60//76.8
const MILLSEC_PER_BEAT = 60.0 / BPM * 1000
let ACTION_DELAY = MILLSEC_PER_BEAT
let DOLLY_ACCTIME = 24 // frame

function convertTimecode(value) {
	if (typeof value != 'number') return '-'

	let sec = Math.floor(value / FPS)
	let min = Math.floor(sec / 60)
	sec = sec - min * 60

	sec = ('00' + sec).substr(-2)
	min = ('00' + min).substr(-2)

	return `${min}:${sec}`
}

function convertMillsecond(value) {
	return (value / FPS * 1000) || 0
}

//--------------------------------------------------
// filter

Vue.filter('seconds', function(value) {
	if (typeof value != 'number')  {
		return '-'
	} else {
		return (value/FPS).toFixed(1) + 's'
	}
})

Vue.filter('frames', function(value) {
	if (typeof value != 'number') {
		return '-'
	} else {
		return value + 'F'
	}
})

Vue.filter('timecode', convertTimecode)

Vue.filter('bool', function(value) {
	return value ? 'o' : ' '
})

//--------------------------------------------------
// class

export default class App extends Vue {

	constructor() {
		super({
			el: 'body',
			data: {
				cuts: window.__loader.cuts,
				current: 22,

				mode: 'table',
				shooting: false,

				accTime: DOLLY_ACCTIME,
				latterTime: 0,
				quarter1Time: 0,
				quarter3Time: 0,
				dollyDuration: 100,

				currentFrame : 0,
				progressStatus: ''
			},
			computed: {
				currentRage: function() {
					let cut = this.cuts[this.current]
					return convertTimecode(convertTimecode(cut.inPoint) + '-' + convertTimecode(cut.outPoint))
				}
			}
		})

		this.track = createjs.Sound.createInstance('track')

		this.$shootingCount = $('.shooting__count')
		this.$progress = $('.shooting__progress')

		// this.track = window.__loader.click

		this.timers = [undefined, undefined, undefined, undefined, undefined]

		this.changeShootingCount = this.changeShootingCount.bind(this)

		Mousetrap.bind('up', this.decrementCut.bind(this))
		Mousetrap.bind('down', this.incrementCut.bind(this))

		Mousetrap.bind('t', () => this.$data.mode = 'table')
		Mousetrap.bind('d', () => this.$data.mode = 'detail')
		Mousetrap.bind('a', () => this.$data.mode = 'action')
		Mousetrap.bind('enter', this.startAction.bind(this))
		Mousetrap.bind('esc', this.escapeAction.bind(this))

		setInterval(() => {
			this.$data.currentFrame = Math.floor(this.track.position / 1000 * 24) + 'F'
		}, 100)
	}

	decrementCut() {
		if (--this.$data.current < 0) {
			this.$data.current = 0
		}
		console.log(this.$data.cuts[this.$data.current])
	}

	incrementCut() {
		if (++this.$data.current >= this.$data.cuts.length) {
			this.$data.current = this.$data.cuts.length - 1
		}
		console.log(this.$data.cuts[this.$data.current])
	}

	changeCut(index) {


		this.$data.current = index
		console.log(this.$data.cuts[this.$data.current])
	}

	changeShootingCount(number) {
		this.$shootingCount.html(number)
	}

	startAction() {
		this.escapeAction()

		let cut = this.$data.cuts[this.$data.current]

		let mute = false

		let actionDelay = ACTION_DELAY
		let trackTime = convertMillsecond(cut.actionStart)
		let dollyDelay = convertMillsecond(cut.inPoint - cut.actionStart - this.$data.accTime)
		let inDelay = convertMillsecond(cut.inPoint - cut.actionStart)
		let latterDelay = convertMillsecond(cut.inPoint - cut.actionStart + (cut.duration / 2))
		let actionDuration = convertMillsecond(cut.outPoint - cut.actionStart + this.$data.accTime)
		let dollyDuration = convertMillsecond(cut.duration + this.$data.accTime)


		if (cut.actionStart == '-') {
			// enable only duiration
			mute = true
			dollyDelay = 0
			actionDuration = convertMillsecond(cut.duration + this.$data.accTime)
			dollyDuration = convertMillsecond(cut.duration + this.$data.accTime)
			latterDelay = convertMillsecond(cut.duration / 2 + this.$data.accTime)
		}

		this.$data.dollyDuration = cut.duration + this.$data.accTime
		this.$data.latterTime = cut.duration / 2 + this.$data.accTime
		this.$data.quarter1Time = cut.duration / 4 + this.$data.accTime
		this.$data.quarter3Time = cut.duration / 4 * 3 + this.$data.accTime

		this.$data.mode = 'action'

		//---------------------------------------------
		// count

		setTimeout(() => {
			// sound
			createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 0})
			createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 1})
			createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 2})
			createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 2.5})
			createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 3})
			createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 3.5})

			if (!mute) {
				this.track.play({offset: trackTime, delay: MILLSEC_PER_BEAT * 4})
			}

			this.$data.shooting = true

			this.changeShootingCount('READY')

			this.timers.push(setTimeout(() => {
				this.escapeAction()
			},  MILLSEC_PER_BEAT * 4 + actionDuration + 2000))

			// highlighting
			this.timers.push(setTimeout(() => {
				this.$progress.attr('data-status', 'former')
				console.log('former')
			}, MILLSEC_PER_BEAT * 4 + inDelay))

			this.timers.push(setTimeout(() => {
				this.$progress.attr('data-status', 'latter')
				console.log('latter')
			}, MILLSEC_PER_BEAT * 4 + latterDelay))

			this.timers.push(setTimeout(() => this.changeShootingCount('4'), MILLSEC_PER_BEAT * 0 + dollyDelay))
			this.timers.push(setTimeout(() => this.changeShootingCount('3'), MILLSEC_PER_BEAT * 1 + dollyDelay))
			this.timers.push(setTimeout(() => this.changeShootingCount('2'), MILLSEC_PER_BEAT * 2 + dollyDelay))
			this.timers.push(setTimeout(() => this.changeShootingCount('1'), MILLSEC_PER_BEAT * 3 + dollyDelay))
			this.timers.push(setTimeout(() => {
				this.changeShootingCount('GO!!')
				this.$progress.transition({x: '0%'}, dollyDuration, 'linear')
			}, MILLSEC_PER_BEAT * 4 + dollyDelay))

		}, actionDelay)

	}

	escapeAction() {
		createjs.Sound.stop()
		this.changeShootingCount(' ')

		this.$progress
			.css({x: '100%'})

		this.$progress.attr('data-status', 'acc')
		this.$data.shooting = false

		this.timers.forEach((timer) => {
			clearTimeout(timer)
		})

		this.timers = []
	}

}
