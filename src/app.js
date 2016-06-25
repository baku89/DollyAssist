/* global createjs */
import 'jquery-touch-events'
import Mousetrap from 'mousetrap'
import 'jquery.transit'

const FPS = 24.0
const BPM = 60//76.8
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
				current: 6,
				mode: 'action',
				shooting: false
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

		this.countTimer = [undefined, undefined, undefined, undefined, undefined]

		this.changeShootingCount = this.changeShootingCount.bind(this)

		Mousetrap.bind('up', () => {
			if (--this.$data.current < 0) {
				this.$data.current = 0
			}
		})

		Mousetrap.bind('down', () => {
			if (++this.$data.current >= this.$data.cuts.length) {
				this.$data.current = this.$data.cuts.length - 1
			}
		})

		Mousetrap.bind('t', () => this.$data.mode = 'table')
		Mousetrap.bind('d', () => this.$data.mode = 'detail')
		Mousetrap.bind('a', () => this.$data.mode = 'action')
		Mousetrap.bind('enter', this.startAction.bind(this))
		Mousetrap.bind('esc', this.escapeAction.bind(this))
	}

	changeCut(index) {
		this.$data.current = index
	}

	changeShootingCount(number) {
		this.$shootingCount.html(number)
	}

	startAction() {
		let cut = this.$data.cuts[this.$data.current]

		let mute = false

		let actionDelay = ACTION_DELAY

		let trackTime = convertMillsecond(cut.actionStart)
		let dollyDelay = convertMillsecond(cut.inPoint - cut.actionStart - DOLLY_ACCTIME)
		let actionDuration = convertMillsecond(cut.outPoint - cut.actionStart + DOLLY_ACCTIME)
		let dollyDuration = convertMillsecond(cut.outPoint - cut.inPoint + DOLLY_ACCTIME)

		if (cut.actionStart == '-') {
			// enable only duiration
			mute = true
			dollyDelay = 0
			actionDuration = convertMillsecond(cut.duration)
			dollyDuration = convertMillsecond(cut.duration)
		}

		this.$data.mode = 'action'

		console.log(trackTime)

		// sound
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 0 + actionDelay})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 1 + actionDelay})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 2 + actionDelay})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 2.5 + actionDelay})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 3 + actionDelay})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 3.5 + actionDelay})

		if (!mute) {
			this.track.play({offset: trackTime, delay: MILLSEC_PER_BEAT * 4 + actionDelay})
		}

		this.$data.shooting = true

		this.changeShootingCount('READY')

		this.actionTimer = setTimeout(() => {
			this.escapeAction()
		},  MILLSEC_PER_BEAT * 4 + actionDuration + actionDelay)

		this.countTimer[0] = setTimeout(() => this.changeShootingCount('4'), MILLSEC_PER_BEAT * 0 + dollyDelay + actionDelay)
		this.countTimer[1] = setTimeout(() => this.changeShootingCount('3'), MILLSEC_PER_BEAT * 1 + dollyDelay + actionDelay)
		this.countTimer[2] = setTimeout(() => this.changeShootingCount('2'), MILLSEC_PER_BEAT * 2 + dollyDelay + actionDelay)
		this.countTimer[3] = setTimeout(() => this.changeShootingCount('1'), MILLSEC_PER_BEAT * 3 + dollyDelay + actionDelay)
		this.countTimer[4] = setTimeout(() => {
			this.changeShootingCount('GO!!')
			this.$progress.transition({x: '0%'}, dollyDuration, 'linear')
		}, MILLSEC_PER_BEAT * 4 + dollyDelay + actionDelay)

	}

	escapeAction() {
		createjs.Sound.stop()
		this.changeShootingCount(' ')

		this.$progress.css({x: '100%'})

		this.$data.shooting = false

		clearTimeout(this.actionTimer)
		clearTimeout(this.countTimer[0])
		clearTimeout(this.countTimer[1])
		clearTimeout(this.countTimer[2])
		clearTimeout(this.countTimer[3])
		clearTimeout(this.countTimer[4])
	}

}
