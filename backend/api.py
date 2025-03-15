import nltk
import langid
from deep_translator import GoogleTranslator
from nltk.sentiment import SentimentIntensityAnalyzer
from flask import Flask, request, jsonify
from flask_cors import CORS
from better_profanity import profanity

# Download necessary NLTK data
nltk.download("vader_lexicon")
sia = SentimentIntensityAnalyzer()

app = Flask(__name__)
CORS(app)

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

app = Flask(__name__)
CORS(app)

@app.route("/api/analyze-feedback", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("message", "").strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    if profanity.contains_profanity(text):
        return jsonify({"error": "Profanity detected. Please provide clean feedback."}), 400

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

# if __name__ == "__main__":
#     app.run(debug=True)
# Vercel requires this
def handler(event, context):
    return app(event, context)