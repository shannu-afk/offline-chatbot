# Offline-Chatbot

A fully offline, intelligent chatbot built using Flask, Ollama, and HTML/CSS/JS. This chatbot provides a ChatGPT-like experience completely offline with multiple model support.

## 🚀 Key Features

- 💬 Interactive chat with multiple AI model support
- 🤖 Support for any Ollama model (Mistral, Llama, CodeLlama, etc.)
- 📁 File understanding (PDF, TXT support)
- 🎙️ Voice input through browser
- 🎨 Modern, responsive UI
- 🔒 100% offline operation - no API keys needed

## 📋 Detailed Features

### 🧠 Multi-Model Support
- Choose from any installed Ollama model
- Switch models during conversation
- Refresh model list with one click
- Automatic model detection

### 📁 File Upload Support
- **Supported Formats:**
  - PDF (.pdf)
  - Text files (.txt)
- **Features:**
  - Automatic content extraction
  - Context-aware responses about uploaded files
  - Error handling for unsupported formats
  - File content size optimization

### 🎙️ Voice Input
- Browser-based speech recognition
- Real-time speech-to-text conversion
- Automatic query submission
- Multiple language support (browser-dependent)

### 💻 User Interface
- Clean, modern design
- Real-time response streaming
- Mobile-responsive layout
- Easy model switching
- File upload progress indication
- Clear message history

## 🛠️ Installation Guide

### 1️⃣ Install Python
1. Download Python 3.10 or newer from [python.org](https://www.python.org/downloads/)
2. During installation:
   - ✅ Check "Add Python to PATH"
   - ✅ Check "Install pip"
3. Verify installation:
   ```bash
   python --version
   ```

### 2️⃣ Install Ollama
1. Download Ollama from [Ollama](https://ollama.com/download)
2. Install and start Ollama
3. Install at least one model:
   ```bash
   # Install Mistral (recommended starter model)
   ollama pull mistral

   # Optional: Install additional models
   ollama pull llama2
   ollama pull codellama
   ```

### 3️⃣ Setup Project
1. Clone or download the project:
   ```bash
   git clone https://github.com/shannu-afk/offline_chatbot.git
   cd offline_chatbot
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 4️⃣ Run the Chatbot
1. Make sure Ollama is running in background
2. Start the Flask server:
   ```bash
   python app.py
   ```
3. Open your browser and go to:
   ```
   http://127.0.0.1:5000
   ```

## 💡 Usage Guide

### Chatting
1. Select your preferred model from the dropdown
2. Type your message and press Send
3. Or click 🎤 for voice input

### File Upload
1. Click "Choose File" button
2. Select a PDF or TXT file
3. Wait for upload confirmation
4. Reference the file in your chat

### Model Switching
1. Use the model dropdown to see available models
2. Click 🔄 to refresh the model list
3. Select a different model anytime
4. Each message will use the currently selected model

## 🔧 Troubleshooting

### Common Issues:
1. **"Error communicating with model"**
   - Ensure Ollama is running
   - Check if selected model is installed
   - Try refreshing the model list

2. **"Speech recognition not supported"**
   - Use a modern browser (Chrome recommended)
   - Allow microphone permissions

3. **File Upload Issues**
   - Check file format (PDF/TXT only)
   - Ensure file isn't corrupted
   - Try with a smaller file if too large

## 📦 Dependencies

### Backend
- Flask==3.0.2
- requests==2.31.0
- PyPDF2==3.0.1

### Frontend
- Modern web browser with:
  - JavaScript enabled
  - Web Speech API support
  - WebSocket support

### External
- Ollama (with at least one model installed)

## 👤 Author

**Kodali Shanmukh Chowdary**
- 📧 Email: kodalishanmukh6thfinger@gmail.com
- 🎓 B.Tech AI & ML
- 🌍 Location: India

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
