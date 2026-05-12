function toggleChat() {
    const body = document.getElementById('chatBody');
    const icon = document.getElementById('chatToggleIcon');
    if (body.style.display === 'none') {
        body.style.display = 'flex';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        body.style.display = 'none';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInputMsg');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    input.value = '';
    
    const loadingId = appendMessage("...", 'ai');
    
    try {
        const data = await apiCall('/ai/chatbot/', 'POST', { message: msg }, false);
        document.getElementById(loadingId).innerText = data.response;
    } catch (e) {
        document.getElementById(loadingId).innerText = "Sorry, I am facing an issue right now.";
    }
}

function appendMessage(text, sender) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    const id = "msg_" + Date.now();
    div.id = id;
    div.className = `msg ${sender}`;
    div.innerText = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
}
