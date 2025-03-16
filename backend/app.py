import nltk
import langid
from deep_translator import GoogleTranslator
from nltk.sentiment import SentimentIntensityAnalyzer
from flask import Flask, request, jsonify
from flask_cors import CORS
from better_profanity import profanity
import os
from http import HTTPStatus

# Download necessary NLTK data
try:
    nltk.download("vader_lexicon", quiet=True)
    sia = SentimentIntensityAnalyzer()
except Exception as e:
    print(f"NLTK initialization error: {e}")

# Create Flask app once
app = Flask(__name__)
CORS(app, origins=["https://silent-iq.vercel.app"], supports_credentials=True)

# Expanded Emotion Mapping
emotion_keywords = {
    "joy": ["happy", "joyful", "excited", "glad", "wonderful", "pleased", "delighted", "cheerful"],
    "sadness": ["sad", "depressed", "unhappy", "down", "miserable", "heartbroken", "melancholy"],
    "anger": ["angry", "furious", "annoyed", "outraged", "mad", "frustrated"],
    "fear": ["scared", "afraid", "nervous", "worried", "anxious", "terrified"],
    "surprise": ["shocked", "amazed", "astonished", "stunned", "speechless", "in awe"],
    "disgust": ["disgusted", "repulsed", "grossed out", "nauseated", "appalled"],
    "love": ["love", "affection", "adore", "cherish", "fond"],
    "guilt": ["guilty", "remorse", "regret", "ashamed"],
    "pride": ["proud", "accomplished", "successful", "confident"]
}

def detect_emotion(text):
    text_lower = text.lower()
    for emotion, keywords in emotion_keywords.items():
        if any(word in text_lower for word in keywords):
            return emotion.capitalize()
    return "Neutral"

def categorize_sentiment(score):
    if score >= 0.7:
        return "Strongly Positive"
    elif score >= 0.05:
        return "Mildly Positive"
    elif score <= -0.7:
        return "Strongly Negative"
    elif score <= -0.05:
        return "Mildly Negative"
    else:
        return "Neutral"

def detect_language(text):
    lang, _ = langid.classify(text)  # More accurate language detection
    return lang

def translate_to_english(text, src_lang):
    if src_lang == "en":
        return text  # No translation needed
    try:
        translated = GoogleTranslator(source=src_lang, target="en").translate(text)
        return translated
    except Exception:
        return text  # If translation fails, return original text

@app.route("/api/analyze-feedback", methods=["POST"])
def analyze():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), HTTPStatus.BAD_REQUEST

        text = data.get("message", "").strip()

        if not text:
            return jsonify({"error": "No text provided"}), HTTPStatus.BAD_REQUEST

        if profanity.contains_profanity(text):
            return jsonify({"error": "Profanity detected. Please provide clean feedback."}), HTTPStatus.BAD_REQUEST

        language = detect_language(text)
        translated_text = translate_to_english(text, language)

        score = sia.polarity_scores(translated_text)
        sentiment = categorize_sentiment(score["compound"])
        emotion = detect_emotion(translated_text)

        return jsonify({
            "original_text": text,
            "translated_text": translated_text,
            "sentiment": sentiment,
            "emotion": emotion,
            "language_detected": language,
        })
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), HTTPStatus.INTERNAL_SERVER_ERROR

# For local development
# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port)