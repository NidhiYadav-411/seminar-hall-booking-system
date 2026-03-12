const API="http://localhost:5000";




function signup(){

fetch(API+"/signup",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
name:document.getElementById("name").value,
email:document.getElementById("emailSignup").value,
phone:document.getElementById("phone").value,
password:document.getElementById("passwordSignup").value,
role:document.getElementById("roleSignup").value
})
})

.then(res=>res.text())
.then(data=>alert(data))

.catch(err=>{
console.error(err);
alert("Signup failed");
})

}




function login(){

fetch(API+"/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:email.value,
password:password.value,
role:role.value
})
})

.then(res=>res.json())

.then(data=>{

if(data.success){

localStorage.setItem("user",JSON.stringify(data.data));
localStorage.setItem("role",role.value);

if(role.value==="user"){
location="calendar.html";
}else{
location="admin.html";
}

}
else{
alert("Invalid login");
}

})

.catch(err=>{
console.error(err);
alert("Login error");
})

}





function book(){

const user=JSON.parse(localStorage.getItem("user"));

if(!user){
alert("User not logged in");
return;
}


const eventName=document.getElementById("event").value || "Seminar";

fetch(API+"/book",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

date:date.value,
start:start.value,
end:end.value,
event:eventName,
details:details.value,
dept:dept.value,
user_id:user.user_id,
hall_id:document.getElementById("hall").value   

})

})

.then(res=>res.text())

.then(data=>{
alert(data);
location="dashboard.html";
})

.catch(err=>{
console.error(err);
alert("Booking failed");
})

}





document.addEventListener("DOMContentLoaded",function(){

if(document.getElementById("calendar")){

fetch(API+"/bookings")

.then(res=>res.json())

.then(data=>{

console.log("Bookings:",data);

let events=data.map(b=>({

title: b.event_name || "Seminar",

start: b.booking_date + "T" + b.start_time,

end: b.booking_date + "T" + b.end_time,

color: (b.status==="Approved") ? "red" : "orange"

}));

let calendar=new FullCalendar.Calendar(

document.getElementById("calendar"),

{

initialView:"dayGridMonth",

headerToolbar:{
left:"prev,next today",
center:"title",
right:"dayGridMonth,timeGridWeek,timeGridDay"
},

events:events

}

);

calendar.render();

})

.catch(err=>{
console.error(err);
alert("Failed to load calendar");
});

}

});
