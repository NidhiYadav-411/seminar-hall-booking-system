/* =======================================
   SEMINAR HALL SCHEDULER
   FRONTEND BOOKING + ADMIN SCRIPT
======================================= */

/* ==============================
   BOOKING FORM (INDEX PAGE)
============================== */

const bookingForm = document.getElementById("hallBookingForm");

if (bookingForm) {

bookingForm.addEventListener("submit", function(event){

event.preventDefault();

/* GET FORM VALUES */

const name = document.getElementById("userName").value.trim();
const email = document.getElementById("userEmail").value.trim();
const phone = document.getElementById("userPhone").value.trim();
const hallId = document.getElementById("hallSelect").value;

const eventDate = document.getElementById("eventDate").value;

const startTime = document.getElementById("startTime").value;
const endTime = document.getElementById("endTime").value;


/* FORM VALIDATION */

if(name === ""){
alert("Please enter your full name");
return;
}

if(email === ""){
alert("Please enter your email");
return;
}

if(!email.includes("@")){
alert("Please enter a valid email address");
return;
}

if(phone.length < 10){
alert("Phone number must contain at least 10 digits");
return;
}

if(hallId === ""){
alert("Please select a seminar hall");
return;
}

if(eventDate === ""){
alert("Please select an event date");
return;
}

if(startTime === "" || endTime === ""){
alert("Please select both start time and end time");
return;
}

/* TIME VALIDATION */

if(startTime >= endTime){
alert("End time must be later than start time");
return;
}


/* CREATE BOOKING OBJECT */

const bookingDetails = {

name: name,
email: email,
phone: phone,
hall_id: hallId,
date: eventDate,
start_time: startTime,
end_time: endTime

};

console.log("Booking Request:", bookingDetails);


/* SEND DATA TO BACKEND */

fetch("http://localhost:3000/book",{

method: "POST",

headers:{
"Content-Type": "application/json"
},

body: JSON.stringify(bookingDetails)

})

.then(response => response.text())

.then(data => {

alert("Booking request submitted successfully!");

bookingForm.reset();

})

.catch(error => {

console.error("Error:", error);

alert("Unable to submit booking. Please try again.");

});

});

}


/* ==============================
   ADMIN DASHBOARD
============================== */

const bookingTable = document.getElementById("bookingTable");

if (bookingTable) {

fetch("http://localhost:3000/bookings")

.then(res => res.json())

.then(data => {

data.forEach(booking => {

bookingTable.innerHTML += `
<tr>
<td>${booking.id}</td>
<td>${booking.name}</td>
<td>${booking.email}</td>
<td>${booking.phone}</td>
<td>${booking.hall_id}</td>
<td>${booking.date}</td>
<td>${booking.start_time} - ${booking.end_time}</td>
<td>${booking.status}</td>
<td>
<button class="btn btn-success btn-sm">Approve</button>
<button class="btn btn-danger btn-sm">Reject</button>
</td>
</tr>
`;

});

})

.catch(err => console.log(err));

}
