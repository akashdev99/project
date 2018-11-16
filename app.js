var express = require("express");
var mysql=require("mysql");
var app=express();
var bodyParser=require("body-parser");
var obj={};
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

var connection=mysql.createConnection({
	   host:'localhost',
	   user:'root',
	   password:'',
	   database:'hosteldb'

});

connection.connect(function(error)
	  {
	  	 if(!error)
	  	 	 {
	  	 	 	 console.log('Connected');
	  	 	 }
	  	 	else
	  	    { console.log('error');
	  	    }
	  })





app.get('/',function(req,res){
   res.render('pages/land');
    
});
//sign in student
app.get('/student/sign',function(req,res){
	res.render('pages/signstud');
});

app.post('/student/sign',function(req,res){
 	var id=req.body.id;
 	var name=req.body.name;
 	var address=req.body.address;
 	var father=req.body.father;
 	var phone=req.body.phone;
 	var department=req.body.department;
 	var room=req.body.room;
 	var block=req.body.block;
 	var password=req.body.password;
 	connection.query("INSERT INTO `student_record` (`Reg`, `Name`, `Address`, `Father_name`, `Phone`, `Department`, `Roomno`, `password`, `block`) VALUES ('"+id+"', '"+name+"', '"+address+"', '"+father+"', '"+phone+"', '"+department+"', '"+room+"', '"+password+"', '"+block+"');",function(error,result){
 			if(!error)
 			{
 				console.log("successfull entered");
 				res.redirect('/'+id);
 			}
 			else
 			{
 				console.log("not entered")
 			}
 	});

});

//sign in warden
app.get('/warden/sign',function(req,res){
	res.render('pages/signwarden');
});
//sign in post
app.post('/warden/sign',function(req,res){
	var id=req.body.id;
 	var name=req.body.name;
 	var phone=req.body.phone;
 	var email=req.body.email;
 	 var password=req.body.password;
 	 var block=req.body.block;
 	connection.query("INSERT INTO `warden` (`W_id`, `Name`, `Phone`, `Email`, `Password`) VALUES ('"+id+"', '"+name+"', '"+phone+"', '"+email+"', '"+password+"') ;",
 		function(error,result){
 			if(!error)
 			{
 				console.log("successfull entered 1st");
 				
 			}
 			else
 			{
 				console.log("not entered")
 				res.redirect('/warden/sign');
 			}
 	});
 	connection.query("INSERT INTO `hostel` (`W_id`, `Block`) VALUES ('"+id+"', '"+block+"');",function(error,result)
 	{
 		if(!error)
 			{
 				console.log("successfull entered 2nd");
 				res.redirect('/warden/'+id);
 				
 			}
 			else
 			{
 				console.log("not entered")
 				res.redirect('/warden/sign');
 			}
 	})
});

app.get('/login',function(req,res)
	  {
	  	 res.render('pages/login');

	  })

app.post('/warden',function(req,res)
	  {
	  	var id_ent=req.body.idw;
	  	var pass_ent=req.body.passwordw;
	  	connection.query("SELECT * FROM `Warden` WHERE W_id='"+id_ent+"'",function(error,result){
	  		if(error)
	  			 {
	  			 	console.log("there is some issue");
	  			 }
            else
            {
            	var x=result[0].Password;
	  				if(x==pass_ent)
	  					{console.log("successfull login");
	  				     res.redirect('/warden/'+id_ent);
	  				    }

	  				else
	  				{
	  				console.log("not correct");
	  			    res.redirect("/login");
	  			    }
            }

	  	});
	  });
app.post('/student',function(req,res)
	  { var id_ent=req.body.ids;
	  	var pass_ent=req.body.passwords;

	  	connection.query("SELECT password FROM `student_record` WHERE `Reg` LIKE '"+id_ent+"'",function(error,result){
	  		if(error)
	  			{   console.log("some issue is there");
	  				
	  			}
	  		else 
	  			{
	  				var x=result[0].password;
	  				if(x==pass_ent)
	  					{console.log("successfull login");
	  				    res.redirect('/'+id_ent);
	  				    }

	  				else
	  				{
	  				console.log("not correct");
	  			    res.redirect("/login");
	  			    }
	  			}
	  			
	  	});
	  	
	  })
//fine form
app.get("/warden/fineform",function(req,res)
{   console.log("in the fineform");
	res.render('pages/fineform');
});
//warden adds fine post
app.post("/warden/fine/new",function(req,res)
{   
	var room=req.body.room;
	var amount=req.body.amount;
	var reason=req.body.reason;
	var id=req.body.id;
	connection.query("INSERT INTO `fine` (`Room_no`, `Amount`, `Reason`, `Status`, `W_id`) VALUES ('"+room+"', '"+amount+"', '"+reason+"', 0, '"+id+"');",function(error,result){
			if(!error)
			{	console.log("fine inserted");
			    res.redirect('/warden/'+id+'/fine');

			}
			else
				console.log("Fine already exist for that room");
	});
	
});

//warden home page 

app.get('/warden/:id',function(req,res){
	var id=req.params.id;
	 	
	 	 connection.query("SELECT * FROM `Warden` WHERE W_id='"+id+"'",function(error,result)
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	
                        console.log(result);
                        
	 	 	 		 	 res.render('pages/wardenhome',{data:result});
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });
});

//view all students
app.get('/warden/:id/view',function(req,res){
	var id=req.params.id;
	console.log(id);
	connection.query("SELECT * FROM `student_record` WHERE block IN (SELECT block FROM hostel WHERE W_id='"+id+"')",function(error,result){
		if(!error){
			 
			 res.render('pages/viewstud',{data:result});
			}
		else
			console.log("wrong");
	});
});
//warden views fine
app.get("/warden/:id/fine",function(req,res){
 	var id=req.params.id;
 	console.log(id);
 	connection.query("SELECT * FROM fine WHERE W_id='"+id+"'",function(error,result){  
 		if(!error){
 			 console.log(result);
 			 res.render('pages/viewfine',{data:result});
 		}
 		else
 			res.send("something went wrong");
 	});
});

//warden views maintenance
app.get("/warden/:id/maintain",function(req,res){
 	var id=req.params.id;
 	connection.query("SELECT * , '"+id+"' AS WARDEN FROM maintenance WHERE Block IN (SELECT Block FROM hostel WHERE W_id ='"+id+"')",function(error,result){  
 		if(!error){

 			console.log(result);
 			 res.render('pages/viewmaintain',{data:result});
 		}
 		else
 			res.send("something went wrong");
 	});
});

//Warden solves the complaint
app.post("/warden/:wid/:room/settle",function(req,res)
	 {
	 	 var wid=req.params.wid;
	 	 var room=req.params.room;
	 	 connection.query("DELETE FROM maintenance WHERE Room_no='"+room+"'",function(error,result){
	 	 	if(!error){
	 	 		res.redirect('/warden/'+wid+'/maintain');
	 	 	}
	 	 	else
	 	 		res.send("ERROR!!");
	 	 });
	 });


//warden removes fine post
app.post("/warden/:id/:room/settlefine",function(req,res){
 	var room=req.params.room;
 	var id=req.params.id;
 	connection.query("UPDATE fine SET STATUS=1 WHERE Room_no='"+room+"' ",function(error,result){
		if(!error){
			 res.redirect('/warden/'+id+'/fine');
		}
		else
			console.log("Didnt settle fine");
 	});
 	
});
app.post("/warden/:id/:room/deletefine",function(req,res){
 	var room=req.params.room;
 	var id=req.params.id;
 	connection.query("DELETE  FROM fine WHERE Room_no='"+room+"' ",function(error,result){
		if(!error){
			 res.redirect('/warden/'+id+'/fine');
		}
		else
			console.log("didnt delete fine");
 	});
 	
});

//warden views gatepassss
app.get('/warden/:id/gatepass',function(req,res){
	var id =req.params.id;
 	connection.query("SELECT * , '"+id+"' AS WARDEN  FROM gatepassd WHERE Reg IN (SELECT Reg FROM student_record WHERE block IN (SELECT block FROM hostel WHERE W_id ='"+id+"'))",function(error,result){
 		if(!error){
 			console.log(result);
			 res.render('pages/wardenpass',{data:result});
		}
		else
			console.log(" failed to render wardenpass");
 	});
});
//warden approves gp
app.post('/warden/:wid/:sid/acceptgp',function(req,res){
	var sid=req.params.sid;
	var wid=req.params.wid;
	console.log('somethins is happing');
	connection.query("UPDATE gatepassd SET Status='1' WHERE Reg='"+sid+"';",function(error,result)
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	
                        console.log(result);
                       
	 	 	 		 	res.redirect('/warden/'+wid+'/gatepass');
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });
});

//warden disproves gatepass
app.post('/warden/:wid/:sid/deletegp',function(req,res){
	var sid=req.params.sid;
	var wid=req.params.wid;
	console.log('somethins is happing');
	connection.query("DELETE FROM gatepassd  WHERE Reg='"+sid+"';",function(error,result)
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	
                        console.log(result);
                       
	 	 	 		 	res.redirect('/warden/'+wid);
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });
});


//warden taking attendance 

app.get('/warden/:wid/attendance',function(req,res){
	var wid=req.params.wid;
	connection.query("SELECT '"+wid+"' AS WARDEN,attendance.status,student_record.Reg,student_record.Name,student_record.Roomno,attendance.Date FROM student_record INNER JOIN attendance ON student_record.Reg=attendance.Reg HAVING Reg IN (SELECT Reg FROM student_record WHERE Block IN ( SELECT Block FROM hostel WHERE W_id='"+wid+"'))",function(error,result){
		if(!error)
	 	 	 		 {  	console.log(result);
	 	 	 		 		res.render('pages/attendance',{data:result})
                        
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	});

});

//warden marks present
app.post('/warden/attendance/:wid/:id/present',function(req,res){
	var wid=req.params.wid;
	var id=req.params.id;
	connection.query("UPDATE attendance SET status=2 where Reg='"+id+"'",function(error,result){
		if(!error){
			res.redirect('/warden/'+wid+'/attendance');
		}
		else
		{
			console.log("failed to mark as present");
		}

	});

});

//warden marks absent
app.post('/warden/attendance/:wid/:id/absent',function(req,res){
	var wid=req.params.wid;
	var id=req.params.id;
	connection.query("UPDATE attendance SET status=1 where Reg='"+id+"'",function(error,result){
		if(!error){
			res.redirect('/warden/'+wid+'/attendance');
		}
		else
		{
			console.log("failed to mark as present");
		}

	});

});

//only present
app.post('/warden/attendancepresent',function(req,res){
	connection.query("SELECT attendance.Reg,attendance.Date,attendance.Room,attendance.Block,attendance.status,student_record.Name FROM `attendance` INNER JOIN student_record ON student_record.Reg=attendance.Reg HAVING attendance.status='2'",function(error,result){
	if(!error){
		console.log(result);
		res.render('pages/presentview',{data:result});
	}
	else
	{
		console.log("didnt redirect to present page");
	}
	});
});

//only absent /warden/attendanceabsent
app.post('/warden/attendanceabsent',function(req,res){
	connection.query("SELECT attendance.Reg,attendance.Date,attendance.Room,attendance.Block,attendance.status,student_record.Name FROM `attendance` INNER JOIN student_record ON student_record.Reg=attendance.Reg HAVING attendance.status='1'",function(error,result){
	if(!error){
		console.log(result);
		res.render('pages/absentview',{data:result});
	}
	else
	{
		console.log("didnt redirect to present page");
	}
	});
});



//warden outing 
app.get('/warden/:wid/outing',function(req,res){
		var id =req.params.wid;
		connection.query("SELECT * FROM warden  WHERE W_id='"+id+"'",function(error,result)
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	console.log(result);
                        res.render('pages/outingform',{data:result});
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });


		

});

//inserting data into outing table
app.post('/warden/:wid/outing',function(req,res){
	 var wid=req.params.wid;
	 var id =req.body.id;
	 var date =req.body.date;
	 var outime=req.body.outime;
	 var intime=req.body.intime;
	 var exceedtime=req.body.exceedtime;
	 var  block=req.body.block;

	 connection.query("INSERT INTO `outing` (`Reg`, `Date`, `Outime`, `Intime`, `Exceedtime`, `Block_status`) VALUES ('"+id+"', '"+date+"', '"+outime+"', '"+intime+"', '"+exceedtime+"', '"+block+"')",function(error,result){
	 				if(!error)
	 	 	 		 {  	
                           res.redirect('warden/'+wid+'/outingview');  //it will duplicate warden/:wid/warden/:wid for some reason
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 });
});


//warden views the outing 
app.get('/warden/:wid/warden/:wid/outingview',function(req,res){
	var wid=req.params.wid;
	connection.query("SELECT * FROM outing WHERE Reg IN (SELECT Reg FROM student_record WHERE BLOCK IN(SELECT Block FROM hostel WHERE W_id='"+wid+"'))   ",function(error,result){
			if(!error)
	 	 	 		 {  	
                           res.render('pages/viewouting',{data:result});
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	});




});









//student home page
app.get('/:id',function(req,res)
	 {   var id=req.params.id;
	 	
	 	 connection.query("SELECT * FROM `student_record` WHERE `Reg` LIKE '"+id+"'",function(error,result)
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	
                        console.log(result);
                        
	 	 	 		 	 res.render('pages/home',{data:result});
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });
	 })
//student files a complaint
app.get('/:id/maintain',function(req,res)
	  { var id=req.params.id;
	  	 connection.query("SELECT * FROM `student_record` WHERE `Reg` LIKE '"+id+"'",function(error,result)
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	
                        console.log(result);
                        
	 	 	 		 	 res.render('pages/maintain',{data:result});
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });
   		
	  });
app.post('/:id/maintain',function(req,res)
	 {
        var id=req.params.id;
        var desc=req.body.descrip;


        connection.query("SELECT * FROM `student_record` WHERE `Reg` LIKE '"+id+"'",function(error,result)
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	
                        
                        connection.query("INSERT INTO `maintenance` (`Room_no`, `Block`, `Description`) VALUES ('"+result[0].Roomno+"', '"+result[0].block+"', '"+desc+"')",function(req,res)
                        {
                        	 if(!error)
                        	 	 {
                        	 	 	 console.log("inserted into mainteneance");

                        	 	 }
                        	 else
                        	 	console.log("some error");
                        });
	 	 	 		 	 
                     }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });


        res.redirect('/'+id);

	 });



app.get('/:id/gatepass',function(req,res){
   var id=req.params.id;
   connection.query("SELECT * FROM `student_record` WHERE Reg='CSE16079' ",function(error,result){
   		if(!error)
                        	 	 {
                        	 	 	 res.render('pages/gatepass',{data:result});

                        	 	 }
                        	 else
                        	 	console.log("some error");
   })
   
    

 
});

app.post('/student/:id/special',function(req,res){
	var id=req.params.id;
	var outdatime=req.body.outdatime;
	var indatime=req.body.indatime;
	var duty=req.body.duty;
	connection.query("INSERT INTO `gatepassd` (`Reg`, `Ininfo`, `Outinfo`, `Status`) VALUES ('"+id+"', '"+indatime+"', '"+outdatime+"', '0');",function(error,result){
				if(!error)
                        	 	 {
                        	 	 	 console.log("gatepassd inserted into table");

                        	 	 }
                        	 else
                        	 {	
                        	 	res.redirect('/'+id+'/gatepass');
                        	 	console.log("gatepassd not entered");
                        	 }
                        	 	
	});


	connection.query("INSERT INTO `special` (`Reg`, `Duty`) VALUES ('"+id+"', '"+duty+"')",function(error,result){
							if(!error)
                        	 	 {
                        	 	 	 console.log("special inserted into table");

                        	 	 }
                        	 else
                        	 {
                        	 	res.redirect('/'+id+'/gatepass');
                        	 	console.log("Emergency not entered");
                        	 }
                        	 	
	});
	connection.query("SELECT gatepassd.Ininfo,gatepassd.Outinfo,gatepassd.Status,gatepassd.Reg,special.Duty FROM gatepassd INNER JOIN special ON gatepassd.Reg=special.Reg;",function(error,result){
							if(!error)
                        	 	 {
                        	 	 	 
                        	 	 	res.render('pages/specialview',{data:result});
                        	 	 }
                        	 else
                        	 	console.log("not rendering specialview");
	});

});




app.post('/student/:id/general',function(req,res){
	var id=req.params.id;
	var outdatime=req.body.outdatime;
	var indatime=req.body.indatime;
	var typee=req.body.typee;
	var reason=req.body.reason;
	connection.query("INSERT INTO `gatepassd` (`Reg`, `Ininfo`, `Outinfo`, `Status`) VALUES ('"+id+"', '"+indatime+"', '"+outdatime+"', '0');",function(error,result){
				if(!error)
                        	 	 {
                        	 	 	 console.log("gatepassd inserted into table");

                        	 	 }
                        	 else
                        	 {	
                        	 	res.redirect('/'+id+'/gatepass');
                        	 	console.log("gatepassd not entered");
                        	 }
                        	 	
	});



	connection.query("INSERT INTO `general` (`Reg`, `Reason`) VALUES ('"+id+"', '"+reason+"')",function(error,result){
							if(!error)
                        	 	 {
                        	 	 	 console.log("Emergency inserted into table");

                        	 	 }
                        	 else
                        	 {
                        	 	res.redirect('/'+id+'/gatepass');
                        	 	console.log("Emergency not entered");
                        	 }
                        	 	
	});
	connection.query("SELECT gatepassd.Ininfo,gatepassd.Outinfo,gatepassd.Status,gatepassd.Reg,general.Reason FROM gatepassd INNER JOIN general ON gatepassd.Reg=general.Reg HAVING Reg='"+id+"';",function(error,result){
							if(!error)
                        	 	 {
                        	 	 	 
                        	 	 	res.render('pages/generalview',{data:result});
                        	 	 }
                        	 else
                        	 	console.log("not rendering gatepassview");
	});

});

app.get('/:id/gatepass/view',function(req,res){
	var id=req.params.id;
	connection.query("SELECT gatepassd.Ininfo,gatepassd.Outinfo,gatepassd.Status,gatepassd.Reg,general.Reason FROM gatepassd INNER JOIN general ON gatepassd.Reg=general.Reg HAVING Reg='"+id+"';",function(error,result){
							if(!error)
                        	 	 {
                        	 	 	 
                        	 	 	res.render('pages/generalview',{data:result});
                        	 	 }
                        	 else
                        	 	console.log("not rendering gatepassview");
	});
});




app.post('/student/:id/emergency',function(req,res){
	var id=req.params.id;
	var outdatime=req.body.outdatime;
	var indatime=req.body.indatime;
	var typee=req.body.typee;
	connection.query("INSERT INTO `gatepassd` (`Reg`, `Ininfo`, `Outinfo`, `Status`) VALUES ('"+id+"', '"+indatime+"', '"+outdatime+"', '0');",function(error,result){
				if(!error)
                        	 	 {
                        	 	 	 console.log("gatepassd inserted into table");

                        	 	 }
                        	 else
                        	 {	
                        	 	res.redirect('/'+id+'/gatepass');
                        	 	console.log("gatepassd not entered");
                        	 }
                        	 	
	});


	connection.query("INSERT INTO `emergency` (`Reg`, `Type`) VALUES ('"+id+"', '"+typee+"')",function(error,result){
							if(!error)
                        	 	 {
                        	 	 	 console.log("Emergency inserted into table");

                        	 	 }
                        	 else
                        	 {
                        	 	res.redirect('/'+id+'/gatepass');
                        	 	console.log("Emergency not entered");
                        	 }
                        	 	
	});
	connection.query("SELECT gatepassd.Ininfo,gatepassd.Outinfo,gatepassd.Status,gatepassd.Reg,emergency.Type FROM gatepassd INNER JOIN emergency ON gatepassd.Reg=emergency.Reg;",function(error,result){
							if(!error)
                        	 	 {
                        	 	 	 
                        	 	 	res.render('pages/emergencyview',{data:result});
                        	 	 }
                        	 else
                        	 	console.log("not rendering gatepassview");
	});

});






app.get('/:id/fees',function(req,res)
	  { var id=req.params.id;
	  	 connection.query("SELECT fees.Reg,fees.Reg,fees.Hostel,fees.Mess,student_record.Name,student_record.Roomno FROM fees INNER JOIN student_record ON fees.Reg=student_record.Reg HAVING Reg='"+id+"'",function(error,result)
	 	 	 
	 	 	 {
	 	 	 	if(!error)
	 	 	 		 {  	
                       
                         res.render('pages/fees',{data:result});                     
                         
                        }

	 	 	 		 
	 	 	 		 else
	 	 	 		 	console.log("something is wrong");
	 	 	 });
   		
	  });

app.listen(9000,function()
	  {
	  	 console.log("server has started");
	  });