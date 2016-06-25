const fs = require('fs')
const _ = require('lodash')

let data = JSON.parse(fs.readFileSync('./src/jade/works-src.json', 'utf8'))

let categoryList = []
data.categories.forEach((category) => {
	categoryList.push(category.name)
	category.works = []
	category.members = []
})

let memberList = []
data.members.forEach((member) => {
	memberList.push(member.slug)
	member.categories = []
	member.works = []
})

data.works.forEach((work, i) => {

	work.categories.forEach((category) => {
		let index = categoryList.indexOf(category)
		if (index != -1) {
			data.categories[index].works.push(i)
			data.categories[index].members = _.union(data.categories[index].members, work.members)
		}
	})

	work.members.forEach((member) => {
		let index = memberList.indexOf(member)
		if (index != -1) {
			data.members[index].works.push(i)
			data.members[index].categories = _.union(data.members[index].categories, work.categories)
		}
	})

})

fs.writeFileSync('./src/jade/works.json', JSON.stringify(data))
