export default class ScoreSatti{
	constructor(){
		Object.assign(this, {
					roundPenalty	: {
						total: 0,
						isNotPlayable: 0
					},
					penalty			: [0],
					xpgain			: [0]
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