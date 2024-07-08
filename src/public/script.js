const sessionId = 'session1';

document.addEventListener('DOMContentLoaded', (event) => {
  const input = document.getElementById('message-input');
  input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  });
});

async function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value;
  if (!message.trim()) return;

  addMessageToChat('user', message);
  input.value = '';

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'session-id': sessionId
      },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const data = await response.json();
      addMessageToChat('bot', data.response);
    } else {
      addMessageToChat('bot', 'Error: Unable to process your message.');
    }
  } catch (error) {
    addMessageToChat('bot', 'Error: Unable to reach the server.');
  }
}

function addMessageToChat(sender, text) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.innerText = text;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
