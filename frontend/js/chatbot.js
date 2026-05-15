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
    
    const loadingId = appendMessage("Thinking...", 'ai');
    
    try {
        const data = await apiCall('/ai/chatbot/', 'POST', { message: msg }, false);
        document.getElementById(loadingId).querySelector('.msg-bubble').innerText = data.response;
    } catch (e) {
        document.getElementById(loadingId).querySelector('.msg-bubble').innerText = "Sorry, I'm facing an issue right now.";
    }
}

function appendMessage(text, sender) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    const id = "msg_" + Date.now();
    div.id = id;
    div.className = `msg ${sender}`;
    
    const avatarIcon = sender === 'ai' ? 'fa-robot' : 'fa-user';
    div.innerHTML = `
        <div class="msg-avatar"><i class="fas ${avatarIcon}"></i></div>
        <div class="msg-bubble">${text}</div>
    `;
    
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
}
