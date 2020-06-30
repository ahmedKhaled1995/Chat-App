// getting the socetio to communicate with the server
const socket = io();

// selecting elements from the dom
const $form = document.querySelector("#message-form");
const $formInput = $form.querySelector("input");
const $formButton = $form.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messagesContainer = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar"); 

// selecting templates to render
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// getting string queries fron the url
const urlStringQueriesObj = Qs.parse(location.search, {ignoreQueryPrefix: true});   // the object will the keys by the name assigned in the "name" attr in the form input html
                                                                                    // i.e  username, room

const autoScroll = () => {
    const $newMessage = $messagesContainer.lastElementChild;

    // note that $messagesContainer only has bottom margin
    const newMessageMargin = parseInt(getComputedStyle($newMessage).marginBottom);                                   
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messagesContainer.offsetHeight;

    const containerHeight = $messagesContainer.scrollHeight;

    const scrollOffset = $messagesContainer.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight;
    }
};

// listening "message" event from the server 
socket.on("message", (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message : message.text,
        createdAt: moment(message.createdAt).format("h:mm a"),
        senderName: message.senderName
    });
    $messagesContainer.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

// listening to "locationMessage" event from the server
socket.on("locationMessage", (location) => {
    console.log(location);
    const html = Mustache.render(locationTemplate, {
        locationUrl: location.urlString,
        createdAt: moment(location.createdAt).format("h:mm a"),
        senderName: location.senderName
    });
    $messagesContainer.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("updateSideBar", (roomInfo) => {
    const html = Mustache.render(sidebarTemplate, {
        room: roomInfo.room,
        users: roomInfo.roomUsers
    });
    $sidebar.innerHTML = html;
});

// adding event to the form   
$form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = $formInput.value;

    // disableing the send message button
    $formButton.setAttribute("disabled", "disabled");

    socket.emit("sendMessage", message, (error) => {

        // enableing message button, clearing the message input and focusing the cursor on the message input field
        $formButton.removeAttribute("disabled");
        $formInput.value = "";
        $formInput.focus();

        if(error){
            console.log(error);
            const html = Mustache.render(messageTemplate, {
                message: "Failed to send message!",
                createdAt: moment(location.createdAt).format("h:mm a")
            });
            $messagesContainer.insertAdjacentHTML("beforeend", html);
            alert(error);
            return;
        }
        console.log("Message sent successfully");
    });
});

// adding event to send location
$locationButton.addEventListener("click", (e) => {
    if(!navigator.geolocation){
        alert("Geolocation is not supported by the borwser!");
        return;
    }

    $locationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((result) => {
        const lat = result.coords.latitude;
        const long = result.coords.longitude;
        socket.emit("sendLocation", {lat, long}, () => {

            $locationButton.removeAttribute("disabled");

            console.log("location shared successfully");

        });
    });
});

// sending "join" event to the server
socket.emit("join", urlStringQueriesObj, (error) => {
    if(error){
        alert(error);
        location.href = "/";
    }
});
