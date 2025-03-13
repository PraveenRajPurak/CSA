from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import html


app = Flask(__name__)
CORS(app)

@app.route('/api/generate-response', methods=['POST'])
def generate_response():
    try:
        # Get data from the frontend
        data = request.json
        
        # Extract fields
        issue = data.get('issue', '')
        needs = data.get('needs', [])
        customer_message = data.get('customerMessage', '')
        context = data.get('context', '')
        draft = data.get('draft', '')
        tone = data.get('tone', 'Professional')
        
        # Construct prompt for Llama3
        needs_str = " + ".join(needs)
        
        prompt = "You are a professional customer support assistant. Generate a clear and polite response based on the details provided below. The response must be in **professional English** with simple words, even if the input is in another language. Keep it **concise, formal, and to the point**.\n\n "
        
        prompt += f"Issue: {issue}\n"
        prompt += f"Need: {needs_str}\n"
        
        if customer_message:
            prompt += f"Customer's original message: {customer_message}\n"
        
        if context:
            prompt += f"Context: {context}\n"
            
        if draft:
            prompt += f"Draft: {draft}\n"
            
        prompt += f"Tone: {tone}"
        
        # Prepare the request to Llama3
        llama_request = {
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
        
        print("Prompt being sent to llama : ",llama_request)
        
        # Make the request to the local Llama3 API
        llama_response = requests.post(
            "http://localhost:11434/api/generate",
            json=llama_request
        )
        
        if llama_response.status_code != 200:
            return jsonify({
                "error": "Failed to get response from Llama3",
                "details": llama_response.text
            }), 500
        
        # Parse the response
        llama_data = llama_response.json()
        raw_response = llama_data.get("response", "")
        
        # Format the response
        # Replace markdown-style bold formatting with HTML tags
        formatted_response = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', raw_response)
        # Replace newlines with HTML breaks
        formatted_response = formatted_response.replace('\n', '<br>')
        
        return jsonify({
            "rawResponse": raw_response,
            "formattedResponse": formatted_response
        })
        
    except Exception as e:
        return jsonify({
            "error": "An error occurred",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)