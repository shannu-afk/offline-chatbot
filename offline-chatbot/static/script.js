// Load available models on page load
window.onload = () => {
  checkOllama();
  refreshModels();
};

// Check if Ollama is running
const checkOllama = () => {
  fetch('/check_ollama')
    .then(res => res.json())
    .then(data => {
      if (data.status !== 'ok') {
        addMessage('bot', `⚠️ ${data.message}\n\n${data.installation}`);
      }
    })
    .catch(err => {
      console.error('Error checking Ollama:', err);
    });
};

// Fetch and populate available models
const refreshModels = () => {
  fetch('/models')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('modelSelect');
      select.innerHTML = '';
      
      if (data.models.includes('ollama_not_available')) {
        const option = document.createElement('option');
        option.value = 'ollama_not_available';
        option.textContent = '⚠️ Ollama Not Installed';
        select.appendChild(option);
        
        addMessage('bot', '⚠️ Ollama is not installed or not running. Please install Ollama from https://ollama.ai and make sure it\'s running.');
        return;
      }
      
      data.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        select.appendChild(option);
      });
      
      // If no models, show a helpful message
      if (data.models.length === 0) {
        addMessage('bot', '⚠️ No models found in Ollama. Please install at least one model using: ollama pull mistral');
      }
    })
    .catch(err => {
      console.error('Error fetching models:', err);
      addMessage('bot', '⚠️ Error loading models. Using default model.');
      
      // Add a fallback option
      const select = document.getElementById('modelSelect');
      const option = document.createElement('option');
      option.value = 'mistral';
      option.textContent = 'mistral (default)';
      select.appendChild(option);
    });
};

// Voice input functionality using the Web Speech API
const startVoiceInput = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('input').value = transcript;
    sendMessage();
  };

  recognition.onerror = (err) => {
    alert('Speech recognition error: ' + err.error);
  };

  recognition.start();
};

// Speech output using SpeechSynthesis API
const speak = (text) => {
  const speechSynthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
};

// Variables for handling chat state
let isGenerating = false;

// Check if these elements exist and reference them
const typingIndicator = document.getElementById('typingIndicator');
const sendButton = document.getElementById('sendButton');
const stopButton = document.getElementById('stopButton');

// Start generation - show typing indicator
function startGeneration() {
  isGenerating = true;
  if (sendButton && stopButton) {
    sendButton.style.display = 'none';
    stopButton.style.display = 'flex';
  }
  if (typingIndicator) {
    typingIndicator.classList.add('visible');
  }
}

// Stop generation - hide typing indicator
function stopGeneration() {
  isGenerating = false;
  if (sendButton && stopButton) {
    sendButton.style.display = 'flex';
    stopButton.style.display = 'none';
  }
  if (typingIndicator) {
    typingIndicator.classList.remove('visible');
  }
}

// Send text message to backend
const sendMessage = () => {
  const input = document.getElementById('input');
  const message = input.value.trim();
  if (!message || isGenerating) return;
  
  const modelSelect = document.getElementById('modelSelect');
  const selectedModel = modelSelect.value;
  
  // Add user message to the UI
  addMessage('user', message);
  
  // Clear the input field
  input.value = '';
  input.style.height = '24px';
  
  // Show typing indicator
  startGeneration();
  
  // Create AbortController with longer timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 70000); // 70 seconds timeout
  
  // Send the message to the backend
  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message,
      model: selectedModel
    }),
    signal: controller.signal
  })
  .then((res) => res.json())
  .then((data) => {
    // Add bot response to the UI
    addMessage('bot', data.response);
    
    // Optional: speak the response
    speak(data.response);
    
    // Hide typing indicator
    stopGeneration();
    clearTimeout(timeoutId);
  })
  .catch((error) => {
    console.error('Error:', error);
    if (error.name === 'AbortError') {
      addMessage('bot', '⚠️ Request timed out. The model is taking too long to respond. Please try a simpler query or try again later.');
    } else {
      addMessage('bot', 'Sorry, there was an error processing your request.');
    }
    stopGeneration();
    clearTimeout(timeoutId);
  });
};

// Add a message to the chat UI
function addMessage(sender, text) {
  const messagesDiv = document.getElementById('messages');
  const messageRow = document.createElement('div');
  messageRow.className = `chat-row ${sender}-row`;
  
  const rowLabel = document.createElement('div');
  rowLabel.className = 'chat-row-label';
  rowLabel.textContent = sender === 'user' ? 'You' : 'AI';
  
  const chatBubble = document.createElement('div');
  chatBubble.className = 'chat-bubble';
  chatBubble.textContent = text;
  
  messageRow.appendChild(rowLabel);
  messageRow.appendChild(chatBubble);
  
  // Insert before typing indicator if it exists
  if (typingIndicator) {
    messagesDiv.insertBefore(messageRow, typingIndicator);
  } else {
    messagesDiv.appendChild(messageRow);
  }
  
  // Scroll to bottom
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Legacy support for old appendMessage function
window.appendMessage = function(sender, text) {
  addMessage(sender, text);
  if (sender === 'bot') {
    stopGeneration();
  }
};

// File upload handler
const uploadFile = () => {
  const file = document.getElementById('fileInput').files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    addMessage('bot', '📁 File uploaded: ' + file.name);
    if (data.content.startsWith('⚠️')) {
      addMessage('bot', data.content);
    }
  });
};

// Clear the chat history
function clearChat() {
  const messages = document.getElementById('messages');
  messages.innerHTML = `
    <div class="chat-row bot-row">
      <div class="chat-row-label">AI</div>
      <div class="chat-bubble">
        Hello! I'm your AI assistant. How can I help you today?
      </div>
    </div>
    
    <div id="typingIndicator" class="chat-row bot-row typing-indicator-container">
      <div class="chat-row-label">AI</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
}

// Replace the original send function with our new one
window.send = sendMessage;

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add auto-resize to input field
  const input = document.getElementById('input');
  if (input) {
    input.addEventListener('input', function() {
      this.style.height = '24px';
      this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Handle Enter key
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  // Initialize button displays
  if (stopButton) {
    stopButton.style.display = 'none';
  }
});
