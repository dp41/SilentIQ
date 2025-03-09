import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from flask import Flask, request, jsonify
from flask_cors import *
nltk.download("vader_lexicon")
sia = SentimentIntensityAnalyzer()

app = Flask(__name__)
CORS(app)
@app.route("/analyze-feedback", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("message", "")
    score = sia.polarity_scores(text)
    if score["compound"] >= 0.05:
        sentiment = "Positive"
    elif score["compound"] <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return jsonify({"sentiment": sentiment})

if __name__ == "__main__":
    app.run(debug=True)
