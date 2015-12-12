var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var ScoreSchema = mongoose.Schema({
		game7:{
			name: {type: String, default: 'game7'},
			stats: {
				roundsPlayed: {type: Number, default: 0},
				xp: {type: Number, default: 0}
			}
		},
		game325:{
			name: {type: String, default: 'game325'},
			stats: {
				roundsPlayed: {type: Number, default: 0},
				xp: {type: Number, default: 0}
			}
		},
		game29:{
			name: {type: String, default: 'game29'},
			stats: {
				roundsPlayed: {type: Number, default: 0},
				xp: {type: Number, default: 0}
			}
		},
		game10:{
			name: {type: String, default: 'game10'},
			stats: {
				roundsPlayed: {type: Number, default: 0},
				xp: {type: Number, default: 0}
			}
		},
		_user: {
				type: Schema.ObjectId,
				ref: 'User'
			}
	});

ScoreSchema.plugin(timestamps);

ScoreSchema.statics.findByUser = function(id, cb){
	this.find({_user: id})
		.exec(function (err, scores){
			if(scores.length == 0){
				var ScoreModel 	= mongoose.model('Score', this);
				var score 		= new ScoreModel({_user: id});
				score.save(function(err){
					if(err) console.log(err);
					cb(score);
				})
			}else{
				cb(scores[0]);
			}
		})
}

module.exports = mongoose.model('Score', ScoreSchema);