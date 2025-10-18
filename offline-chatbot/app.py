from flask import Flask, render_template, request, jsonify
import requests
import PyPDF2
import os
import time
import subprocess

app = Flask(__name__)
chat_history = []
uploaded_text = ""

# Check if Ollama is installed and running
def is_ollama_available():
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        return response.status_code == 200
    except:
        return False

# Get available models from Ollama
def get_available_models():
    if not is_ollama_available():
        return ["ollama_not_available"]  # Special flag
        
    try:
        response = requests.get("http://localhost:11434/api/tags")
        response.raise_for_status()
        models = response.json().get('models', [])
        return [model['name'] for model in models]
    except Exception as e:
        return ["mistral"]  # Default fallback

# Chat Model using Ollama HTTP API
def chat_with_model(history, model_name="mistral"):
    if model_name == "ollama_not_available":
        return "⚠️ Ollama is not installed or not running. Please install Ollama and make sure it's running.\n\nInstallation steps:\n1. Download from https://ollama.ai\n2. Install the application\n3. Start Ollama\n4. Pull a model: `ollama pull mistral`\n5. Restart this Flask app"
    
    prompt = "\n".join([f"You: {msg['user']}\nBot: {msg['bot']}" for msg in history[:-1]])
    prompt += f"\nYou: {history[-1]['user']}\nBot:"

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
        response.raise_for_status()
        return response.json().get('response', '').strip()
    except requests.exceptions.ConnectionError:
        return "⚠️ Cannot connect to Ollama. Please make sure Ollama is running."
    except requests.exceptions.Timeout:
        return "⚠️ Request to Ollama timed out. Please try again later."
    except requests.exceptions.HTTPError as e:
        if "404" in str(e):
            if "model" in str(e).lower():
                return f"⚠️ Model '{model_name}' not found. Please run: ollama pull {model_name}"
            else:
                return "⚠️ Ollama API endpoint not found. Please make sure you have the latest version of Ollama."
        return f"⚠️ Error communicating with the model: {str(e)}"
    except Exception as e:
        return f"⚠️ Error communicating with the model: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/models')
def models():
    available_models = get_available_models()
    return jsonify({'models': available_models})

@app.route('/check_ollama', methods=['GET'])
def check_ollama():
    status = is_ollama_available()
    if status:
        return jsonify({'status': 'ok', 'message': 'Ollama is running'})
    else:
        # Try to suggest installation method based on platform
        import platform
        system = platform.system()
        install_guide = ""
        
        if system == "Windows":
            install_guide = "Download Ollama from https://ollama.ai and install it."
        elif system == "Darwin":  # macOS
            install_guide = "Install Ollama with: brew install ollama"
        elif system == "Linux":
            install_guide = "Install Ollama following the guide at https://github.com/ollama/ollama#linux"
            
        return jsonify({
            'status': 'error', 
            'message': 'Ollama is not running or not installed',
            'installation': install_guide
        })

@app.route('/chat', methods=['POST'])
def chat():
    global uploaded_text
    data = request.json
    user_msg = data['message']
    model_name = data.get('model', 'mistral')  # Default to mistral if not specified

    # Inject uploaded file if user wants to reference it
    if "upload" in user_msg.lower() or "file" in user_msg.lower():
        if uploaded_text.startswith("⚠️"):
            user_msg += f"\n\nNote: {uploaded_text}"
        else:
            user_msg += f"\n\nHere is the uploaded content:\n{uploaded_text}"

    chat_history.append({'user': user_msg, 'bot': ''})
    bot_response = chat_with_model(chat_history, model_name)
    chat_history[-1]['bot'] = bot_response
    return jsonify({'response': bot_response})

@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_text
    uploaded_file = request.files['file']
    content = ""

    try:
        if uploaded_file.filename.endswith('.pdf'):
            reader = PyPDF2.PdfReader(uploaded_file)
            text = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text.strip())
            content = "\n".join(text)
        elif uploaded_file.filename.endswith('.txt'):
            content = uploaded_file.read().decode('utf-8')
        else:
            content = "⚠️ Unsupported file type. Please upload a PDF or TXT file."

        content = content.strip().replace('\n\n', '\n')[:1500]  # Sanitize and limit
        if not content or content.startswith("\u0000"):
            content = "⚠️ File content could not be read or is empty."

    except Exception as e:
        content = "⚠️ An error occurred while reading the file."

    uploaded_text = content
    return jsonify({'content': content})

if __name__ == '__main__':
    app.run(debug=True)
