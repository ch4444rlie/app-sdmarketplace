from flask import Flask, jsonify
import requests
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/tools": {"origins": "*"}})  # Allow all for simplicity

try:
    with open('data/tools.json', 'r') as f:
        tools = json.load(f)
except FileNotFoundError:
    print("Error: data/tools.json not found")
    tools = []

def scrape_and_cache():
    if not tools:
        return []
    scraped = []
    for tool in tools:
        if tool['Type'] == 'Open-Source' and tool['Repo']:
            try:
                url = f"https://api.github.com/repos/{tool['Repo']}"
                response = requests.get(url, headers={"Accept": "application/vnd.github.v3+json"}, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    stars = data.get("stargazers_count", 0)
                    forks = data.get("forks_count", 0)
                    tool['Popularity'] = f"{stars} Stars / {forks} Forks"
                    tool['Stars'] = stars
                else:
                    tool['Popularity'] = "N/A"
                    tool['Stars'] = 0
            except Exception:
                tool['Popularity'] = "N/A"
                tool['Stars'] = 0
        else:
            tool['Popularity'] = tool.get('Popularity', 'N/A')
            tool['Stars'] = 0
        scraped.append(tool)
    
    open_source = sorted([t for t in scraped if t['Type'] == 'Open-Source'], key=lambda x: x['Stars'], reverse=True)
    for i, t in enumerate(open_source, 1):
        t['Rank'] = i
    
    updated_tools = open_source + [t for t in scraped if t['Type'] == 'Proprietary']
    
    try:
        with open('data/cache.json', 'w') as f:
            json.dump(updated_tools, f, indent=4)
    except Exception as e:
        print(f"Error writing cache: {str(e)}")
    
    return updated_tools

print("Scraping GitHub and updating cache...")
updated_tools = scrape_and_cache()
print("Done.")

@app.route('/tools', methods=['GET'])
def get_tools():
    if not updated_tools:
        return jsonify({"error": "No tools available, check backend setup"}), 500
    return jsonify(updated_tools)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Added host='0.0.0.0'