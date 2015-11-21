var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
	userId : String,
	chats : [{
		message : String,
		from 	: {type : mongoose.Schema.ObjectId, ref : 'User'},
		to 		: {type : mongoose.Schema.ObjectId, ref : 'User'},
		status 	: String,
		date 	: { type: Date, default: Date.now }
	}]
})
/**
* This function will retireve unread chats for particular user
*/
ChatSchema.statics.retrieveChats = function (userid, index, cb) {
	// var user
	return this.model('Chat').find({to : userid}, function (err, chats){

	})
}
/**
* This function will retireve chats for particular user
*/
ChatSchema.methods.retrieveChats = function (userid, index) {
	// body...
}
/**
* This function will save chat object for particular user
*/
ChatSchema.methods.saveChats = function (userid, ChatObj) {
	// body...
}