const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userslist = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

socket.emit("joinroom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoom(room);
  outputusers(users);
});

socket.on("message", (data) => {
  console.log(data);
  outputMessage(data);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

outputMessage = (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p class="meta">${msg.username} <span>${msg.time}</span></p>
            <p class="text">
              ${msg.text}
            </p>
            `;
  document.querySelector(".chat-messages").appendChild(div);
};

function outputRoom(room) {
  roomName.innerText = room;
}

function outputusers(users) {
  userslist.innerHTML = `
    ${users.map((user) => `<li>${user.username}<li>`).join("")}
    `;
}
