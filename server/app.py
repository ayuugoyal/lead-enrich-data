import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["https://lead-enrich-data.vercel.app", "http://localhost:3000"])

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError(
        "No API key found. Please set GOOGLE_API_KEY environment variable. "
        "Get your API key from https://makersuite.google.com/app/apikey"
    )

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/enrich', methods=['POST'])
def enrich_company_data():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        company_name = data.get('company_name')
        website = data.get('website')

        if not company_name or not website:
            return jsonify({"error": "Both company name and website are required"}), 400

        prompt = f"""
        Generate a detailed company profile for {company_name} (website: {website}).
        Return the response in the following JSON format:
        {{
            "company_name": "{company_name}",
            "website": "{website}",
            "description": "Brief company description",
            "industry": "Primary industry",
            "estimated_size": "Approximate employee count",
            "products_services": ["Main product/service 1", "Main product/service 2"],
            "headquarters": "Location if known",
            "year_founded": "Year if known",
            "key_features": ["Feature 1", "Feature 2"]
        }}
        """
        
        response = model.generate_content(prompt)
        generated_text = response.text
        
        try:
            response_text = generated_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            enriched_data = eval(response_text)
            return jsonify(enriched_data), 200
        except Exception as parse_error:
            return jsonify({
                "error": "Failed to parse AI response",
                "details": str(parse_error),
                "raw_response": generated_text
            }), 500

    except genai.types.generation_types.GenerationException as e:
        return jsonify({"error": "AI model error", "details": str(e)}), 500
    except Exception as e:
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500

@app.after_request
def apply_cors_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
