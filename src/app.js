/* global createjs */
import 'jquery-touch-events'
import Mousetrap from 'mousetrap'

const FPS = 24.0
const BPM = 76.8
const MILLSEC_PER_BEAT = 60.0 / BPM * 1000
let ACTION_DELAY = MILLSEC_PER_BEAT

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
	return value / FPS * 1000
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
				current: 20,
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
		// this.track = window.__loader.click

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
		Mousetrap.bind('esc', this.escapeAction.bind(this))
	}

	changeCut(index) {
		this.$data.current = index
	}

	changeShootingCount(number) {
		this.$shootingCount.html(number)
	}

	startAction() {
		let offset = convertMillsecond( this.$data.cuts[this.$data.current].inPoint )

		let dollyDelay = 0

		// sound
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 0 + ACTION_DELAY})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 1 + ACTION_DELAY})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 2 + ACTION_DELAY})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 2.5 + ACTION_DELAY})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 3 + ACTION_DELAY})
		createjs.Sound.play('click', {offset: 0, delay: MILLSEC_PER_BEAT * 3.5 + ACTION_DELAY})
		this.track.play({offset, delay: MILLSEC_PER_BEAT * 4 + ACTION_DELAY})

		this.$data.shooting = true

		setTimeout(() => this.changeShootingCount('4'), MILLSEC_PER_BEAT * 0 + ACTION_DELAY + dollyDelay)
		setTimeout(() => this.changeShootingCount('3'), MILLSEC_PER_BEAT * 1 + ACTION_DELAY + dollyDelay)
		setTimeout(() => this.changeShootingCount('2'), MILLSEC_PER_BEAT * 2 + ACTION_DELAY + dollyDelay)
		setTimeout(() => this.changeShootingCount('1'), MILLSEC_PER_BEAT * 3 + ACTION_DELAY + dollyDelay)
		setTimeout(() => this.changeShootingCount(' '), MILLSEC_PER_BEAT * 4 + ACTION_DELAY + dollyDelay)

	}

	escapeAction() {
		createjs.Sound.stop()
		this.changeShootingCount(' ')
		this.$data.shooting = false
	}

}
