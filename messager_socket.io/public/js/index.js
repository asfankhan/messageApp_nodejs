
var gradeHelp=[];
var socket = io.connect();

var Comments=[];
var commentView=1;
var currComment;
var currUser;
var offset=0;
//for testing
currUser = {
    name: 'a',
    Email: 'a',
    currGrade: 5,
    points: 0,
    auth: true,
    dateCreated: new Date
}
currComment = {
    UserId: null,
    Date: null,
    grade: null,
    commentContent: null,
    reply: []
}
$( document ).ready(function() {

	$('.modal-trigger').leanModal();
	DisplayInfo();
    
    $("#Back").click(function () {
        $("#mainPage").css("display", "inline");
        $("#commentPage").css("display", "none");
        DisplayComments();
		DisplayReplies()

    });


    $("#sign_Up").click(function () {
		if ($("#regUser").val() == ""){
            $('#errormsgSignup').html("Please enter a username");
        } else if ($("#regPass1").val() == "") {
            $('#errormsgSignup').html("Please enter a password");
        } else if ($("#regPass1").val() != $("#regPass2").val()) {
            $('#errormsgSignup').html("Please enter a matching password");
        } else if ($("#regEmail").val() == "") {
            $('#errormsgSignup').html("Please enter a email");
        }else if ($("#regCurrGrade").val() == "") {
            $('#errormsgSignup').html("Please enter a grade");
        }else {
            $('#errormsgSignup').html("");
            $('#signupModal').closeModal();

            var userName = {
                name: $("#regUser").val(),
                password: $("#regPass1").val(),
                currGrade: $("#regCurrGrade").val(),
                auth: false,
                points:0,
                Email: $("#regEmail").val(),
                dateCreated: new Date
            };

			$("#regUser").val("");
			$("#regPass1").val("")
			$("#regPass2").val("")
			$("#regCurrGrade").val("")
			$("#regEmail").val("")

			socket.emit('new User',userName);

        }
	});
    $("#Sign_In").click(function () {

    	socket.emit('login User',{name:$("#logUser").val(),pass:$("#logPass").val()});

		
		socket.on('login User', function(data){
			console.log("Got here");

			console.log(data);

			if(data==[])
			{
				$('#errormsgLogIn').html("Username or password dont match");
			}else{
				DisplayInfo();
				DisplayComments();
				$('#errormsgLogIn').html("");
				currUser = {
    				name: data[0].name,
    				Email: data[0].Email,
					currGrade: data[0].currGrade,
					points: data[0].points,
					auth: data[0].auth,
				}    
				    $("#signinModal").closeModal();
			}

		});
	});
    $("#Log_Out").click(function () {
        currUser = {
            name: null,
            password: null,
            points: 0,
            currGrade: null,
            auth: null,
            Email: null,
            dateCreated: null
        };

        DisplayInfo();
        DisplayComments();
        $('#settingModal').closeModal();
    });

    $("#createComment").click(function () {
        if (currUser.name == null) {
            $('#errormsgComment').html("Please log in first");
        } else if ($("#commentTextArea").val() == "") {
            $('#errormsgComment').html("Please enter the Comment");
        } else {
            $('#errormsgComment').html("");

            $('#addModal').closeModal();
            var commentObj = {
                UserId: currUser.name,
                Date: new Date,
                grade:currUser.currGrade,
                auth: false,
                commentContent: $("#commentTextArea").val(),
                reply: []
            }
			$("#commentTextArea").val("")

			socket.emit('new Comment',commentObj);
			DisplayComments();

        }
    });
    $("#createResponse").click(function () 
    {
    	if (currUser.name == null) {
            $('#errormsgResponse').html("Please log in first");
        } else if ($("#ResponseTextArea").val() == "") {
            $('#errormsgResponse').html("Please enter a proper reply");
        } else {
            $('#errormsgResponse').html("");
            $('#ResponseModel').closeModal();
            responseObj = {
                UserId: currUser.name,
                Date: new Date,
                commentContent: $("#ResponseTextArea").val(),
                auth: false
            }
			$("#ResponseTextArea").val("")

			socket.emit('new Response',{id:currComment,responses:responseObj});

           	DisplayReplies();
        }
    });


    $("#tabs").on('click', 'div.tabinfo', function (e) {
        alert($(this).attr('id'));
		currComment = $(this).attr('id');
        $("#mainPage").css("display", "none");
        $("#commentPage").css("display", "inline");

        $('textarea#responseText').html($(this).text());
		
		socket.emit('find Comment',{id:$(this).attr('id')});
		socket.on('find Comment', function(data){
			DisplayReplies();

		});
    });
    $("#tabs").on('click', 'img.tabClose', function (e) {


    	if(currUser.auth==true)
    	{
		socket.emit('delete Comment',{id:$(this).attr('id')});
		socket.on('delete Comment', function(data){
			DisplayComments();
		});
		}else{	
        	alert("Dont have the authority");
		}
    });

    $("#responsetabs").on('click', 'img.tabClose', function (e) {
		j=0;
		for(var i=0;i<Comments.length;i++){
			if(Comments[i].id==currComment)
			{
				j=i
			}
		}

        for (var i = 0; i < Comments[j].reply.length; i++) {
            if (Comments[j].reply[i]) {
                if (currUser.auth == true) {
                    if (Comments[j].reply[i]["commentContent"] + Comments[j].reply[i]["Date"] == $(this).attr('id')) {
                        
                        Comments[j].reply[i] = null;
						socket.emit('delete Response',{id:currComment, Comment:Comments[j]});

                        DisplayReplies()
                        return;
                    }
                } else {
                    alert("Dont have the authority");
                    return;
                }
            }
        }
        alert($(this).attr('id'));

    });

	$("btn").click(function (event) {
        if ($(this).is(".g1"))
        {
            $(this).addClass("disabled");
            gradeHelp[gradeHelp.length] = $(this).attr('id');
        }
    });

	$("#showback").click(function (){
		console.log("text callback");
		var socket = io.connect();

		//socket.emit('get Comments');

	});
	socket.on('display Response', function(data){
		console.log("Got here");

		console.log(data);
		DisplayReplies();

	});

	socket.on('display Comments', function(data){
		console.log("Got here");

		console.log(data);
		Comments=data;
		DisplayComments();

	});
});
function DisplayReplies() {
    $('#responsetabs').empty();
    j=0;
    for(var i=0;i<Comments.length;i++){
    	if(Comments[i].id==currComment)
    	{
    		j=i
    	}
    }
    console.log(Comments[j])
    if (Comments[j])
        {
        for (var i = Comments[j].reply.length - 1; i >= 0; i--) {
            if (Comments[j].reply[i])
                createReply(Comments[j].reply[i]);
    }
       } 
}
function createReply(obj) {

    var pad = document.createElement("Div");

    pad.setAttribute("style", "padding:.5vw; padding-top: 2vh;");
    pad.setAttribute("class", "col s12 tab");

    var tab = document.createElement("Div");

    tab.setAttribute("class", "col s8 light-green lighten-2 tabinfo");
    tab.setAttribute("id", obj.commentContent + obj.Date);
    tab.setAttribute("style", "height:10vh; padding:5px; overflow:auto;");

    var tab1 = document.createElement("img");
    tab1.setAttribute("class", "col s2 tabApprove");
    tab1.setAttribute("id", obj.commentContent + obj.Date);
    tab1.setAttribute("style", "height:10vh; padding:5px");
    tab1.setAttribute("src", "img/thumbsup.png");

    var tab2 = document.createElement("img");
    tab2.setAttribute("class", "col s2 tabClose");
    tab2.setAttribute("id", obj.commentContent + obj.Date);
    tab2.setAttribute("style", "height:10vh; padding:5px");
    tab2.setAttribute("src", "img/notification_error.png");

    pad.appendChild(tab);
    pad.appendChild(tab1);
    pad.appendChild(tab2);
    if (obj.auth == false && currUser && (obj.UserId == currUser.name|| currUser.auth==true))
    {
        var S = document.createTextNode("Still needs approval: "+obj.commentContent);

    }else if (obj.auth == true)
    {
        var S = document.createTextNode(obj.commentContent);
    } else {
        var S = document.createTextNode("posted by User: " + obj.UserId + ": Still needs approval");
    }

    // Append the text to <button>
    tab.appendChild(S);

    //document.body.appendChild(btn);
    document.getElementById("responsetabs").appendChild(pad);
}

function DisplayComments()
{
    $('#tabs').empty();
    if (commentView == 1) {

        for (var i = Comments.length - 1; i >= 0 - offset; i--) {
            if (Comments[i]) {
                createComments(Comments[i]);
            }
        }
    } else if (commentView == 2) {
        for (var i = Comments.length - 1; i >= 0 - offset; i--) {
            if (Comments[i]) {
                console.log("CommentGrade "+Comments[i].grade)

                console.log(jQuery.inArray(Comments[i].grade.toString(), gradeHelp))
                if (jQuery.inArray(Comments[i].grade.toString(), gradeHelp) >-1)
                    createComments(Comments[i]);
            }
        }
    }
}
function createComments(obj)
{

    var pad = document.createElement("Div");

    pad.setAttribute("style", "padding:.5vw; padding-top: 2vh;");
    pad.setAttribute("class", "col s12 tab");

    var tab = document.createElement("Div");

    tab.setAttribute("class", "col s8 light-green lighten-2 tabinfo");
    tab.setAttribute("id", obj.msg + obj.created);
    tab.setAttribute("style", "height:10vh; padding:5px; overflow:auto;");

    var tab1 = document.createElement("img");
    tab1.setAttribute("class", "col s2 tabApprove");
    tab1.setAttribute("id", obj.msg + obj.created);
    tab1.setAttribute("style", "height:10vh; padding:5px;");
    tab1.setAttribute("src", "img/thumbsup.png");

    var tab2 = document.createElement("img");
    tab2.setAttribute("class", "col s2 tabClose");
    tab2.setAttribute("id", obj.msg + obj.created);
    tab2.setAttribute("style", "height:10vh; padding:5px");
    tab2.setAttribute("src", "img/notification_error.png");

    pad.appendChild(tab);
    pad.appendChild(tab1);
    pad.appendChild(tab2);
    if (obj.auth == false && currUser && (obj.name == currUser.name || currUser.auth == true))
    {
        var S = document.createTextNode("Still needs approval: "+obj.msg);

    }else if (obj.auth == true) {
        var S = document.createTextNode(obj.msg);
    } else {
        var S = document.createTextNode("posted by User: " + obj.name + ": Still needs approval");
    }

    // Append the text to <button>
    tab.appendChild(S);

    //document.body.appendChild(btn);
    document.getElementById("tabs").appendChild(pad);
}

function DisplayInfo() {
    if(currUser)
    {
        $('#myName').html("User: " + currUser.name);
        $('#myPoints').html("Points: "+currUser.points);

    } else {
        $('#myName').html("");
        $('#myPoints').html("");
    }
}

