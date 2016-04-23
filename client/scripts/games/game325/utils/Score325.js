var score = function () {
	return {
		'handsMade' : 0,
		'handsToMake' : 0,
	}
}
export default class Score325{
	constructor(){
		Object.assign(this, {
						'gameRound'		: 0,
						'handsMade' 	: 0,
						'handsToMake' 	: 0
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