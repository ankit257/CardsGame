var mongoose = require('mongoose');
var BookSchema = new mongoose.Schema({
	'googleId' : String,
	'goodreadsId' : String,
	'title' : String,
	'author' : String,
	'image' : String,
	'genre' : String,
	'isbn13' : String,
	'language' : String,
	'added' : {type : Date, default : Date.now},
	'is_deleted' : Boolean,
});

// BookSchema.statics.findById = function(id){
// 	return this.model('Book').find({'_id' : id});
// }
BookSchema.methods.searchByTitle = function (string) {
	return this.model('Book').find({});
}
BookSchema.methods.deleteBook = function(bookId){
	return this.model('Book').save({});
}

module.exports = mongoose.model('Book', BookSchema);