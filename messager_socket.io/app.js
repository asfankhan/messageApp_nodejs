var express = require('express'),
	app = express(),
	server= require('http').createServer(app),
	io= require('socket.io').listen(server),
	mongoose = require('mongoose'),
	path = require('path');

//This allows for the use of other scripts
app.use(express.static(__dirname + '/public'));
//This is the port that the server is run on
server.listen(3000);
//Connects to the mongodb server and returns if connected or not
mongoose.connect('mongodb://localhost/chat', function(err){
	if(err)
	{
		console.log(err);
	}else{
		console.log("connected to mongodb");
	}
});
//This is the User object
var userSchema= mongoose.Schema({
	name:String,
	password:String,
	currGrade: 0,
	auth:false,
	points: 0,
	Email: String,
	created: Date
});
//This is the comment object
var commentSchema= mongoose.Schema({
	id:String,
	name:String,
	msg:String,
	created: Date,
	auth:false,
	grade: 0,
	reply:[]
});
//This is the response object
var responseSchema= mongoose.Schema({
	id:String,
	name:String,
	msg:String,
	created: Date,
	auth:false
});
//creates instance of an onject
var User = mongoose.model("User",userSchema)
var comment = mongoose.model("comment",commentSchema)




//connects to the socket io
io.sockets.on('connection', function(socket){

//how to clear a collection
// comment.remove({}, function(err) {
//             if (err) {
//                 console.log(err)
//             } else {
//                 console.log('success');
//             }
//         });

//this is what happenes when the user is created
	socket.on('new User', function(data){

		var newUser= new User({
			name:data.name,
			password:data.password,
			currGrade: data.currGrade,
			auth:false,
			points: 0,
			Email: data.Email,
			created: data.dateCreated
		});

		newUser.save(function(err){
			if(err)
				throw err;

			//io.sockets.emit('new Comment',data);
		});
	});
	socket.on('login User', function(data){
		User.find({name:data.name,password:data.pass},function(err,doc){
		if(err)throw err;
		
		//console.log("USers");
		//console.log(doc);

		io.sockets.emit('login User',doc);
		});
	});

//this is what happenes when the user is created
	socket.on('new Comment', function(data){

		var newcomment= new comment({
			id:data.commentContent + data.Date,
			name:data.UserId,
			msg:data.commentContent,
			created: data.Date,
			grade: data.grade,
			auth:false,
			reply:[]
		});

		newcomment.save(function(err){
			if(err)
				throw err;
		comment.find({},function(err,doc)
		{
			if(err)throw err;
			
			console.log("comment:");

			io.sockets.emit('display Comments',doc);

			console.log(doc);

		});
		
		});
	});
	socket.on('find Comment', function(data){
		comment.find(data,function(err,doc){
		if(err)throw err;
		
		console.log("The comment is");
		console.log(doc);

		io.sockets.emit('find Comment',doc[0]);
		});
	});
	socket.on('delete Comment', function(data){
		comment.remove(data,function(err,doc){
		if(err)throw err;
		
		console.log("The comment is");
		console.log(doc);

		io.sockets.emit('delete Comment',doc[0]);
		});
		comment.find({},function(err,doc)
		{
			if(err)throw err;
			
			console.log("comment:");

			io.sockets.emit('display Comments',doc);

			console.log(doc);

		});
	});
	socket.on('new Response', function(data){
		comment.find({id:data['id']},function(err,doc)
		{

			if(err)throw err;
			doc[0].reply[doc[0].reply.length]=data.responses
			var newcomment= new comment({
			id:doc[0].id,
			name:doc[0].name,
			msg:doc[0].msg,
			created:doc[0].created,
			grade:doc[0].grade,
			auth:doc[0].auth,
			reply:doc[0].reply
			});
			comment.remove({id:data['id']},function(err,doc){
				if(err)throw err;
		
				console.log("The comment removed is");
				console.log(doc);

				io.sockets.emit('delete Comment',doc[0]);
			});

			console.log("before reply:");
			console.log(doc[0].reply[doc[0].reply.length]=data.responses);
			console.log("after replay:");
			console.log(doc[0]);

			newcomment.save(function(err){
				if(err)
					throw err;
		comment.find({},function(err,doc)
	{
		if(err)throw err;
		
		console.log("comment:");

		io.sockets.emit('display Comments',doc);

		console.log(doc);

	});
			io.sockets.emit('display Response',newcomment);
				});


			//console.log(doc);

		});
		console.log("ssssssssssssssssss");
			comment.find({},function(err,doc)
	{
		if(err)throw err;
		
		console.log("comment:");

		io.sockets.emit('display Comments',doc);

		console.log(doc);

	});
	});
	socket.on('delete Response', function(data){
		console.log(data.Comment)
		var newcomment= new comment({
		id:data.Comment.id,
		name:data.Comment.name,
		msg:data.Comment.msg,
		created:data.Comment.created,
		grade:data.Comment.grade,
		auth:data.Comment.auth,
		reply:data.Comment.reply
		});
		comment.remove({id:data['id']},function(err,doc){
			if(err)throw err;
		
			console.log("The comment removed is");
			console.log(doc);

			io.sockets.emit('delete Comment',doc[0]);
		});
		newcomment.save(function(err){
			if(err) throw err;

			io.sockets.emit('display Response',newcomment);
		});
	});
	User.find({},function(err,doc)
	{
		if(err)throw err;
		
		console.log("USers");

		console.log(doc);

	});
	comment.find({},function(err,doc)
	{
		if(err)throw err;
		
		console.log("comment:");

		io.sockets.emit('display Comments',doc);

		console.log(doc);

	});	// Chat.find({},function(err,doc)
	// {
	// 	if(err)throw err;

	// 	console.log(doc);

	// 	io.sockets.emit('load old msg',doc);

	// });

	//this recieves data from the front end
	socket.on('send message', function(data){
		//this sends the data to the new message socket
		var newMsg= new Chat({msg:data,username:"no name"})
		newMsg.save(function(err){
			if(err)
				throw err;

			io.sockets.emit('new message',data);

		});
	});	
	//if a person disconnects this will activate
	socket.on('disconnect', function(data){

	});
});