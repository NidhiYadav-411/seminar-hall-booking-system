const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

console.log("Starting Server...");


const db = mysql.createConnection({
host:"localhost",
user:"root",
password:"@Nidhi21346",
database:"seminarhallbooking",
port:3307
});

db.connect((err)=>{

if(err){
console.error("Database connection failed:",err);
process.exit();
}

console.log("MySQL Connected Successfully");

});



const transporter = nodemailer.createTransport({
service:"gmail",
auth:{
user:"nidhiyadav21346@gmail.com",
pass:"irba jgpg znvo jbmf"
}
});



const PORT = 5000;

app.listen(PORT,()=>{
console.log(`Server running on http://localhost:${PORT}`);
});



app.get("/test",(req,res)=>{
res.send("Backend working");
});



app.post("/signup",(req,res)=>{

const {name,email,phone,password,role}=req.body;

if(!email || !password){
return res.status(400).send("Missing fields");
}

if(!email.endsWith("@mmcoe.edu.in")){
return res.send("Use college email (@mmcoe.edu.in)");
}

if(role==="user"){

const sql="INSERT INTO users(user_name,user_email,user_phone,password) VALUES (?,?,?,?)";

db.query(sql,[name,email,phone,password],(err)=>{

if(err){
console.log(err);
return res.send("User already exists");
}

res.send("User Registered Successfully");

});

}
else{

const sql="INSERT INTO admin(admin_name,admin_email,password) VALUES (?,?,?)";

db.query(sql,[name,email,password],(err)=>{

if(err){
console.log(err);
return res.send("Admin already exists");
}

res.send("Admin Registered Successfully");

});

}

});



app.post("/login",(req,res)=>{

const {email,password,role}=req.body;

let sql;

if(role==="user"){
sql="SELECT * FROM users WHERE user_email=? AND password=?";
}else{
sql="SELECT * FROM admin WHERE admin_email=? AND password=?";
}

db.query(sql,[email,password],(err,result)=>{

if(err){
console.log(err);
return res.json({success:false});
}

if(result.length>0){
res.json({success:true,data:result[0]});
}else{
res.json({success:false});
}

});

});



app.get("/bookings",(req,res)=>{

const sql=`
SELECT 
b.booking_id,
b.booking_date,
b.start_time,
b.end_time,
b.event_name,
b.dept,
h.hall_name,
u.user_name,
u.user_phone,
u.user_email
FROM bookings b
JOIN users u ON b.user_id=u.user_id
JOIN seminarhall h ON b.hall_id=h.hall_id
WHERE b.status='Approved'
`;

db.query(sql,(err,result)=>{

if(err){
console.log(err);
return res.json([]);
}

res.json(result);

});

});



app.post("/book",(req,res)=>{

const {date,start,end,event,details,dept,user_id,hall_id}=req.body;

const check=`
SELECT * FROM bookings
WHERE booking_date=?
AND hall_id=?
AND status='Approved'
AND (
(start_time < ? AND end_time > ?)
OR
(start_time >= ? AND start_time < ?)
)
`;

db.query(check,[date,hall_id,end,start,start,end],(err,result)=>{

if(result.length>0){
return res.send("Slot already booked");
}

const sql=`
INSERT INTO bookings
(booking_date,start_time,end_time,event_name,event_details,dept,user_id,hall_id)
VALUES (?,?,?,?,?,?,?,?)
`;

db.query(sql,[date,start,end,event,details,dept,user_id,hall_id],(err)=>{

if(err){
console.log(err);
return res.send("Booking failed");
}

res.send("Booking request submitted");

});

});

});



app.get("/userBookings/:id",(req,res)=>{

const sql=`
SELECT b.*, h.hall_name
FROM bookings b
JOIN seminarhall h ON b.hall_id=h.hall_id
WHERE b.user_id=?
ORDER BY booking_date
`;

db.query(sql,[req.params.id],(err,result)=>{

if(err){
console.log(err);
return res.json([]);
}

res.json(result);

});

});



app.get("/requests",(req,res)=>{

const sql=`
SELECT b.*, h.hall_name
FROM bookings b
JOIN seminarhall h ON b.hall_id=h.hall_id
ORDER BY b.booking_id ASC
`;

db.query(sql,(err,result)=>{

if(err){
console.log(err);
return res.json([]);
}

res.json(result);

});

});


app.post("/approve",(req,res)=>{

const {id}=req.body;

const sql="UPDATE bookings SET status='Approved' WHERE booking_id=?";

db.query(sql,[id],()=>{

db.query(
`SELECT u.user_email,b.event_name,b.booking_date,b.start_time,b.end_time
FROM bookings b
JOIN users u ON b.user_id=u.user_id
WHERE b.booking_id=?`,
[id],
(err,result)=>{

if(result.length>0){

const user=result[0];

const mailOptions={
from:"yourgmail@gmail.com",
to:user.user_email,
subject:"Seminar Hall Booking Approved",
text:`Your booking for "${user.event_name}" on ${user.booking_date} from ${user.start_time} to ${user.end_time} has been APPROVED.`
};

transporter.sendMail(mailOptions,(error)=>{
if(error){
console.log(error);
}
});

}

});

res.send("Booking Approved");

});

});

 

app.post("/reject",(req,res)=>{

const {id}=req.body;

const sql="UPDATE bookings SET status='Rejected' WHERE booking_id=?";

db.query(sql,[id],()=>{

db.query(
`SELECT u.user_email,b.event_name,b.booking_date
FROM bookings b
JOIN users u ON b.user_id=u.user_id
WHERE b.booking_id=?`,
[id],
(err,result)=>{

if(result.length>0){

const user=result[0];

const mailOptions={
from:"yourgmail@gmail.com",
to:user.user_email,
subject:"Seminar Hall Booking Rejected",
text:`Your booking for "${user.event_name}" on ${user.booking_date} has been REJECTED.`
};

transporter.sendMail(mailOptions,(error)=>{
if(error){
console.log(error);
}
});

}

});

res.send("Booking Rejected");

});

});



app.post("/deleteBooking",(req,res)=>{

const {id}=req.body;

const sql="DELETE FROM bookings WHERE booking_id=?";

db.query(sql,[id],(err)=>{

if(err){
console.log(err);
return res.send("Delete failed");
}

res.send("Booking deleted successfully");

});

});



app.post("/cancel",(req,res)=>{

const {id}=req.body;

const sql="DELETE FROM bookings WHERE booking_id=?";

db.query(sql,[id],(err)=>{

if(err){
console.log(err);
return res.send("Cancel failed");
}

res.send("Booking cancelled successfully");

});

});
