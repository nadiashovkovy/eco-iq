import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS # ensures frontend can access backend
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import openai

import os

app = Flask(__name__)
CORS(app)

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY") # shhh 

def fetch_website_content(url):
    """Fetch the content of the website."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup.get_text(separator=' ', strip=True)
    except Exception as e:
        return str(e)

def analyze_sustainability(content):
    """use gpt-4o to analyze the sustainability of the company."""
    try:

        messages = [
            {"role": "system", "content": "You are an expert in sustainability analysis."},
            {"role": "user", "content": f"""
            Based on the given website content, analyze the company's sustainability performance across the following three categories:
            1. **Environmental Impact**
            2. **Supply Chain & Resources**
            3. **Business Operations**

            Assign a numerical score (1-10) for each category based on sustainability efforts and provide a descriptive analysis. Then, calculate an **overall sustainability score (1-100)** by equally weighing all three categories.

            **Website Content:** 
            {content}

            Please infer the **company's name** from the content and include it in the response.

            **Return the result in strict JSON format (without markdown syntax, just raw JSON):**
            {{
                "company_name": "<extracted or inferred company name>",
                "environmental_impact": {{
                    "score": <integer between 1-10>,
                    "description": "<brief analysis>"
                }},
                "supply_chain_resources": {{
                    "score": <integer between 1-10>,
                    "description": "<brief analysis>"
                }},
                "business_operations": {{
                    "score": <integer between 1-10>,
                    "description": "<brief analysis>"
                }},
                "overall_score": <integer between 1-100>
            }}
            """}
        ]
        response = openai.ChatCompletion.create(
            model="gpt-4o", 
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )
        raw_result = response['choices'][0]['message']['content'].strip()
        print("Raw GPT Response:", raw_result)

        clean_result = re.sub(r"```json|```", "", raw_result).strip()
        
        structured_data = json.loads(clean_result)
        return structured_data

    except json.JSONDecodeError as e:
        print("JSON Parsing Error:", str(e))
        return jsonify({"error": "GPT response is not valid JSON", "details": raw_result}), 500
    except Exception as e:
        print("GPT API Error:", str(e)) 
        return jsonify({"error": "Failed to process GPT response", "details": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        url = request.json.get('url')
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        content = fetch_website_content(url)
        if not content:
            return jsonify({"error": "Failed to fetch website content"}), 500

        analysis = analyze_sustainability(content)
        if isinstance(analysis, tuple):  #error case (returns (json, 500))
            return analysis

        return jsonify(analysis) 
    except Exception as e:
        print("Backend Error:", str(e))
        return jsonify({"error": "Failed to process request", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  
    app.run(host='0.0.0.0', port=port, debug=True)