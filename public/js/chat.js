var createText = document.querySelector(".chat-typing-form");
const socket = io().connect();
var currChat = document.querySelector(".curr-chat");
var chatBody = document.querySelector(".chat-body");

var conversations = document.getElementsByClassName("conversation-preview-display");
var recipientIds = [];
var  q;
for(const conv of conversations) {
    recipientIds.push(conv.dataset.recipientid);
    console.log(recipientIds);
}
var arr = encodeURIComponent(JSON.stringify(recipientIds));

$.ajax({
    url: "/users/chat/contacts/" + arr, 
    method: "GET", 
})
.then(response => {
    q = response;
    for(const recipient of response) {
        let currId = "recipient-id-" + recipient.id;
        let currInitialsId = "recipient-initials-" + recipient.id;

        let currDisplay = document.getElementById(currId);
        let currInitials = document.getElementById(currInitialsId);

        currDisplay.textContent = recipient.firstName + " " + recipient.lastName;
        currInitials.textContent = recipient.firstName[0] + recipient.lastName[0];
    } 
})
.catch(err => {
    console.log(err);
})


function displayMessage(text, isUserText) {
    const newText = document.createElement("p");
    const textContainer = document.createElement("div");

    newText.textContent = text;
    newText.classList.add("text");

    if(isUserText) {
        newText.classList.add("user-text");
        textContainer.classList.add("user-text-container");
    } else {
        newText.classList.add("recipient-text");
        textContainer.classList.add("recipient-text-container");
    }

    textContainer.appendChild(newText);
    chatBody.appendChild(textContainer);

    createText.elements[0].value = "";
}

socket.on("connect", () => {
    console.log("we get in the connection");
    console.log(socket.id);
    $.ajax({
        url: "/users/chat/create-connection", 
        method: "POST",
        headers: {
            "token": localStorage.getItem("jwt")
        },
        data: {
            socketId: socket.id 
        }
    })
    .then(response => {
        console.log(response);
    })
    .catch(err => {
        console.log(err);
    })
});

socket.on("message", message => {
    displayMessage(message.text, false);
})

createText.addEventListener("submit", event => {
    event.preventDefault();
    
    $.ajax({
        url: "/users/chat", 
        method: "POST", 
        data: {
            connectionId: socket.id, 
            recipientId: currChat.dataset.recipientid, 
            text: createText.elements[0].value
        }, 
        headers: {
            "token": localStorage.getItem("jwt")
        }
    })
    .then(response => {
        console.log(response);
        displayMessage(createText.elements[0].value, true);
    })
    .catch(err => {
        console.log(err);
    })

});