import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variable
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError(
        "No API key found. Please set GOOGLE_API_KEY environment variable. "
        "Get your API key from https://makersuite.google.com/app/apikey"
    )

# Configure Google Generative AI with the API key
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

        # Generate company information using Gemini
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
        
        # Parse the generated content
        try:
            # Clean up the response text to ensure it's valid JSON
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]  # Remove ```json and ``` markers
            enriched_data = eval(response_text)
            return jsonify(enriched_data), 200
        except Exception as parse_error:
            return jsonify({
                "error": "Failed to parse AI response",
                "details": str(parse_error),
                "raw_response": response.text
            }), 500

    except Exception as e:
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)