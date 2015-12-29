export default class ScoreSatti{
	constructor(){
		Object.assign(this, {
					roundPenalty	: {
						total: 0,
						isNotPlayable: 0
					},
					penalty			: [0,10,14,25,3,24,10],
					xpgain			: []
		})
	}
	getTotalPenalty(){
		let sum = 0;
		for(let points of this.penalty){
			sum += points;
		}
		return sum;
	}
}