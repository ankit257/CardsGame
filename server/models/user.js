var requestActions = {
	'REQUEST_RENT': 'REQUEST_RENT',
	'REQUEST_EXCHANGE': 'REQUEST_EXCHANGE'
}

var mongoose = require('mongoose');

// var UserSchema = mongoose.Schema;
var UserSchema = mongoose.Schema({
	email : String,
	facebook: {
		id: String,
		firstName: String,
		lastName : String,
		image: String
	},
	updated: {
		type: Date,
		default: Date.now()
	},
	created: {
		type: Date,
		default: Date.now()
	}
});
// UserSchema.statics.findNearByWithBook = function(bookId, coordinates, maxDistance, pageNo, callback) {
// 	var limit = 20;
// 	var skip = limit*(pageNo-1);
// 	console.log(bookId);
// 	return this.model('User').find(
// 		{
// 			loc: { $nearSphere: coordinates, $maxDistance: 50},
// 			'library' :  bookId
// 		}
// 		// function (err, users){
// 		// 	if(err)
// 		// 		throw err;
// 		// 	callback(users);
// 		// });
// 		).populate('library').exec(function (err, users){
// 			if(err)
// 				throw err;
// 			callback(null, users);
// 		});
// }
// UserSchema.statics.findNearBy = function(coordinates, maxDistance, pageNo, callback) {
// 	var limit = 20;
// 	var skip = limit*(pageNo-1);
// 	return this.model('User').aggregate([
// 		{ "$geoNear": {
// 		    "near": coordinates,
// 		    "maxDistance": maxDistance,
// 		    "distanceField": "dist.calculated",
// 		    spherical : true,
// 		  }
// 		},
// 		{ $unwind : '$library' },
// 		{ $group : {
// 				_id : '$library',
// 				users : { $addToSet : {id :'$_id', loc : '$loc.coordinates'} } } 
// 		},
// 		{ $limit : limit },
// 		{ $skip : skip }
// 	], function (err, e){
// 		if(err)
// 			console.log(err)
// 		//Get array of books Ids from result populated above
// 		var x = [];
// 		for (var i = e.length - 1; i >= 0; i--){
// 			x.push(e[i]._id)
// 		}
// 		// Get detailed Book Info and add it to the result
// 		Book.find({'_id': {$in: x}}, function (err, c){
// 			if (err) {
// 				callback(err)
// 			}
// 			for (var i = c.length - 1; i >= 0; i--) {
// 				for (var j = e.length - 1; j >= 0; j--) {
// 					if(e[j]._id.toString() == c[i]._id.toString()){
// 						e[j]['book'] = c[i];
// 					}
// 				}
// 			}
// 			callback(null, e);
// 		})
// 		// User.populate(e, function (err, c){
// 		// 	console.log(c)
// 		// })
// 	});
// }
// UserSchema.methods.getBookStaus = function(userId, isbn, callback) {
// 	return this.model('User').findOne({'_id': userId, 'library' : {$elemMatch : {isbn : isbn}}}, function (err, book){
// 		if(err){
// 			callback(err);
// 		}
// 		if(book){
// 			callback(null, book);
// 		}else{
// 			callback(null, 'NA');
// 		}
// 	})
// }
// UserSchema.statics.addBook = function(userId, newBook, callback){
// 	var self = this;
// 	var isbnString = newBook['isbn13'].toString();
// 	Book.findOne({'isbn13' : isbnString}, function (err, book){
// 		if(err)
// 			throw err;
// 		if(book){
// 			return self.model('User').findByIdAndUpdate(userId, {$addToSet: {library: book._id}}, {  safe: true, upsert: true, new : true}, function(err, model) {
// 		        if(err){
// 		        	callback(err)
// 		        }
// 		        self.model('User').findOne({'_id' : userId}).populate('library').exec(function (err, library){
// 		        	console.log(library.library.length);
// 		        	// callback(err, model)
// 		        })
// 		    })
// 		}else{
// 			var bookObj = new Book;
// 			for(key in newBook){
// 				bookObj[key] = newBook[key]
// 			}
// 			bookObj.save(function (err, book){
// 				return self.model('User').findByIdAndUpdate(userId, {$addToSet: {library: book._id}}, {  safe: true, upsert: true, new : true}, function(err, model) {
// 			        if(err){
// 			        	callback(err)
// 			        }
// 			        // callback(err, model)
// 			        self.model('User').findOne({'_id' : userId}).populate('library').exec(function (err, library){
// 			        	// console.log(library.library);
// 			        })
// 			    })
// 			})
// 		}
// 	})
//  // return this.model('User').findByIdAndUpdate(userId, { $push: {"library": book}}, {  safe: true, upsert: true}, function(err, model) {
//  //        if(err){
//  //        	callback(err)
//  //        }
//  //        callback(err, model)
//  //    })
// }
// // UserSchema.methods.addBook = function(userId, isbn, callback) {
// // 	return this.model('User').findOne({'_id': userId, 'library' : {$elemMatch : {isbn : isbn}}}, function (err, book){
// // 		if(err){
// // 			callback(err);
// // 		}
// // 		if(book){
// // 			callback(null, book);
// // 		}else{
// // 			callback(null, 'NA');
// // 		}
// // 	})
// // }
// UserSchema.methods.lendBook = function(bookObj, toUserObj) {

// }
// UserSchema.methods.rentBook = function(bookObj, fromUserObj) {

// }
// UserSchema.methods.addRequests = function(requestType, User) {

// }
// UserSchema.methods.updateLocation = function(coordinares) {

// }
module.exports = mongoose.model('User', UserSchema);