// Name entry logic
const nameEntry = document.getElementById("nameEntry");
const chatUI = document.getElementById("chatUI");
const nameInput = document.getElementById("nameInput");
const enterChatBtn = document.getElementById("enterChatBtn");
const userNameDisplay = document.getElementById("userNameDisplay");

// Check localStorage for username
let userName = localStorage.getItem("chatUserName") || "";
if (userName) {
  userNameDisplay.textContent = `You: ${userName}`;
  nameEntry.classList.add("hidden");
  chatUI.classList.remove("hidden");
}

// Profile image selection logic
let selectedProfileImg =
  localStorage.getItem("chatProfileImg") ||
  "https://randomuser.me/api/portraits/men/32.jpg";

function updateProfileSelection(imgUrl) {
  document.querySelectorAll(".profile-img").forEach((img) => {
    img.classList.remove("ring-4", "ring-green-400");
    if (img.getAttribute("data-img") === imgUrl) {
      img.classList.add("ring-4", "ring-green-400");
    }
  });
}

document.querySelectorAll(".profile-img").forEach((img) => {
  img.addEventListener("click", function () {
    selectedProfileImg = this.getAttribute("data-img");
    localStorage.setItem("chatProfileImg", selectedProfileImg);
    updateProfileSelection(selectedProfileImg);
  });
});

// On load, highlight selected profile
updateProfileSelection(selectedProfileImg);

enterChatBtn.addEventListener("click", enterChat);
nameInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") enterChat();
});

function enterChat() {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.classList.add("ring-2", "ring-red-500");
    setTimeout(() => nameInput.classList.remove("ring-2", "ring-red-500"), 800);
    return;
  }
  userName = name;
  localStorage.setItem("chatUserName", userName);
  localStorage.setItem("chatProfileImg", selectedProfileImg);
  userNameDisplay.textContent = `You: ${userName}`;
  nameEntry.classList.add("hidden");
  chatUI.classList.remove("hidden");
  chatUI.classList.add("fade-in");
  setTimeout(() => chatUI.classList.remove("fade-in"), 800);
}

// Server status logic
const serverStatusDot = document.querySelector("#serverStatus span");
const serverStatusText = document.querySelector("#serverStatus .text-xs");

function setServerStatus(online) {
  if (online) {
    serverStatusDot.style.display = "";
    serverStatusText.classList.remove("hidden");
  } else {
    serverStatusDot.style.display = "none";
    serverStatusText.classList.add("hidden");
  }
}

// WebSocket logic
const socket = new WebSocket("ws://localhost:8080/ws");

socket.onopen = function () {
  setServerStatus(true);
  console.log("Connected to the chat server");
};

socket.onclose = function () {
  setServerStatus(false);
};

socket.onerror = function () {
  setServerStatus(false);
};

socket.onmessage = function (event) {
  const message = JSON.parse(event.data);
  displayMessage(message, false);
};

function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  if (!input.value.trim()) return;
  const message = {
    sender: userName || "User",
    content: input.value,
    profileImg: selectedProfileImg,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  socket.send(JSON.stringify(message));
  input.value = "";
}

function displayMessage(message) {
  const chatBox = document.getElementById("chatBox");
  const isOwn = message.sender === userName;
  let profileImg = message.profileImg;
  if (!profileImg) {
    profileImg = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
      message.sender
    )}`;
  }
  const messageElement = document.createElement("div");
  messageElement.className = `flex w-full mb-2 ${
    isOwn ? "justify-end" : "justify-start"
  }`;
  messageElement.innerHTML = `
    <div class="flex items-end gap-2 max-w-full ${
      isOwn ? "flex-row-reverse" : ""
    }">
      <img src="${profileImg}"
        class="w-8 h-8 rounded-full border-2 border-blue-500 shadow bg-white flex-shrink-0 self-end"
        alt="Profile" onerror="this.src='https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
          message.sender
        )}'" />
      <div class="relative px-3 py-2 rounded-2xl shadow-lg text-base transition-all duration-300 max-w-[70vw] sm:max-w-md md:max-w-lg
        ${
          isOwn
            ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-none"
            : "bg-gray-800 text-blue-200 rounded-bl-none"
        }">
        <div class="flex items-center gap-2 mb-0">
          <span class="block font-semibold text-xs">${message.sender}</span>
        </div>
        <span class="block break-words leading-snug text-sm">${
          message.content
        }</span>
        <span class="block text-xs text-gray-400 mt-1 text-right">${
          message.timestamp
        }</span>
      </div>
    </div>
  `;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("messageForm").addEventListener("submit", sendMessage);

// On load, if userName exists, set selectedProfileImg from localStorage
if (userName) {
  selectedProfileImg =
    localStorage.getItem("chatProfileImg") || selectedProfileImg;
  updateProfileSelection(selectedProfileImg);
}

// Logout logic
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("chatUserName");
    localStorage.removeItem("chatProfileImg");
    userName = "";
    selectedProfileImg = "https://randomuser.me/api/portraits/men/32.jpg";
    nameInput.value = "";
    updateProfileSelection(selectedProfileImg);
    chatUI.classList.add("hidden");
    nameEntry.classList.remove("hidden");
    nameEntry.classList.add("fade-in");
    setTimeout(() => nameEntry.classList.remove("fade-in"), 800);
  });
}
