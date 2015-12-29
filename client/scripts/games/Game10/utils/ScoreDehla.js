export default class ScoreDehla{
	constructor(){
		Object.assign(this, {
					roundPenalty	: {
						total: 0,
						isNotPlayable: 0
					},
					penalty			: [],
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