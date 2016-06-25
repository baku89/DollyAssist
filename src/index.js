import MobileDetect from 'mobile-detect'
import $ from 'jquery'
import 'jquery-touch-events'
import Vue from 'Vue'

const IS_MOBILE = new MobileDetect(window.navigator.userAgent).mobile() != null

// const DEFAULT_THUMB = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

if (IS_MOBILE) {
	$('html').addClass('mobile')
}

class App extends Vue {

	constructor() {

		let data = JSON.parse(document.getElementById('works-data').innerText)

		super({
			el: 'body',
			data: {

				// data
				categories: data.categories,
				works: data.works,
				members: data.members,

				// layout
				portrait: false,
				titleHeight: null,
				backgroundHeight: 'inherit',
				backgroundHidden: false,
				contentOverflow: true,

				// active
				active: {
					object: null,
					thumb: '',
					thumbPortrait: '',
					categories: [],
					works: [],
					members: []
				}

			}
		})

		this.$window = $(window)
		this.$content = $('.content')

		this.thumbLoaded = {
			normal: false,
			portrait: false
		}

		$(window).on({
			'resize': this.onResize.bind(this),
			'scroll': this.onScroll.bind(this),
			'click tap': this.onWindowClick.bind(this)
		}).trigger('resize')

	}

	// --------------------------------------------------
	// window events

	onResize() {
		this.$data.portrait = window.innerWidth / window.innerHeight < 0.72
		this.$data.contentOverflow = window.innerHeight < this.$content.outerHeight()

		if (IS_MOBILE) {
			this.$data.titleHeight = `${window.innerHeight}px`
			this.$data.backgroundHeight = `${window.screen.availHeight}px`
		}

		this.preloadThumbs()
	}

	onScroll() {
		this.$data.backgroundHidden = this.$window.scrollTop() < window.innerHeight * 0.4
	}

	onWindowClick(e) {
		// console.log(e.target.tagName.toLowerCase())
		if (e.target.tagName.toLowerCase() != 'a') {
			this.onMouseleave()
		}

		// if (e.target.tagName != 'a'
	}

	// --------------------------------------------------
	// preload
	preloadThumbs() {

		// portrait
		if (this.$data.portrait) {
			if (this.thumbLoaded.portrait) return
			this.thumbLoaded.portrait = true
			console.log('load portrait')

		// normal
		} else {
			if (this.thumbLoaded.normal) return
			this.thumbLoaded.normal = true
			console.log('load normal')
		}

		// preload iamges
		let remaining = this.$data.works.length
		this.$data.works.forEach((work) => {
			let thumb = this.$data.portrait ? (work.thumb_portrait || work.thumb) : work.thumb
			let img = new Image()
			img.src = thumb
			img.onload = () => {
				if (--remaining == 0) console.log('loaded')
			}
		})
	}


	// --------------------------------------------------
	// vue events
	onHoverCategory(category) {
		this.active.works = category.works
		this.active.members = category.members
	}

	onHoverWork(work) {
		this.active.thumb = work.thumb
		this.active.thumbPortrait = work.thumb_portrait || work.thumb
		this.active.categories = work.categories
		this.active.members = work.members
	}

	onHoverMember(member) {
		this.active.works = member.works
		this.active.categories = member.categories
	}

	// for mobile
	onClickLink(item, e) {
		// console.log('clicked!!!', this.active.object, item)
		if (IS_MOBILE && this.active.object != item) {
			// console.log('prevent!!')
			e.preventDefault()
		}
		this.active.object = item
	}

	onMouseleave() {
		this.active.thumb = ''
		this.active.thumbPortrait = ''
		this.active.categories = []
		this.active.works = []
		this.active.members = []
	}

	showThumb(url) {
		this.active.thumb = url
	}
	clearThumb() {
		this.active.thumb = ''
	}
}


new App()
