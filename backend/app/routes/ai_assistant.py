"""
Gnaneswar Fitness Platform - AI Assistant Routes
API endpoints for AI Fitness Coaching chat Q&A.
"""

from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_required

ai_bp = Blueprint("ai", __name__)

FITNESS_KNOWLEDGE_BASE = [
    {
        "keywords": ["hello", "hi", "hey", "start", "greetings"],
        "response": "Hey there! 💪 I'm your AI Fitness Assistant. I can help with workout advice, nutrition tips, supplement guidance, and more. What would you like to know?"
    },
    {
        "keywords": ["lose weight", "weight loss", "fat loss", "burn fat"],
        "response": "For effective fat loss:\n\n1. **Caloric Deficit** — Eat 300-500 calories below maintenance\n2. **High Protein** — 1.6-2.2g per kg bodyweight\n3. **Strength Training** — 3-4x per week to preserve muscle\n4. **Cardio** — 2-3 sessions of LISS or HIIT\n5. **Sleep** — 7-9 hours nightly\n\nWant me to recommend a specific plan? Check out our weight loss programs!"
    },
    {
        "keywords": ["build muscle", "muscle gain", "bulk", "gain weight", "mass"],
        "response": "To build muscle effectively:\n\n1. **Caloric Surplus** — Eat 300-500 calories above maintenance\n2. **Protein** — 1.8-2.2g per kg bodyweight\n3. **Progressive Overload** — Increase weight/reps weekly\n4. **Compound Movements** — Squat, Deadlift, Bench, Rows\n5. **Rest** — Each muscle group needs 48-72hr recovery\n\nOur muscle building programs are designed for exactly this!"
    },
    {
        "keywords": ["protein", "how much protein"],
        "response": "**Protein Recommendations:**\n\n• **General Fitness**: 1.2-1.6g/kg bodyweight\n• **Muscle Building**: 1.8-2.2g/kg bodyweight\n• **Fat Loss**: 2.0-2.4g/kg bodyweight\n• **Competition Prep**: 2.2-2.8g/kg bodyweight\n\nGreat sources: Chicken, Fish, Eggs, Paneer, Whey Protein, Lentils, Greek Yogurt"
    },
    {
        "keywords": ["supplement", "supplements", "creatine", "whey"],
        "response": "**Essential Supplements:**\n\n1. 🥤 **Whey Protein** — Convenient protein source\n2. 💊 **Creatine Monohydrate** — 5g daily, proven for strength\n3. 🐟 **Fish Oil / Omega-3** — Joint health & recovery\n4. ☀️ **Vitamin D3** — Most people are deficient\n5. 🧲 **Magnesium** — Sleep & recovery\n\nRemember: Supplements are additions to a solid diet, not replacements!"
    },
    {
        "keywords": ["diet", "meal plan", "what to eat", "nutrition"],
        "response": "**Balanced Nutrition Framework:**\n\n🍽️ **Per Meal Structure:**\n• 1 palm-sized protein source\n• 1 fist-sized carb source\n• 1 thumb-sized fat source\n• 2 fists of vegetables\n\n⏰ **Meal Timing:** 4-6 meals spread evenly\n\nCheck out our custom nutrition plans for a personalized approach!"
    },
    {
        "keywords": ["workout", "exercise", "training", "routine"],
        "response": "**Recommended Training Splits:**\n\n🏋️ **Beginner**: Full Body 3x/week\n💪 **Intermediate**: Upper/Lower 4x/week\n🔥 **Advanced**: Push/Pull/Legs 6x/week\n\nEach session should include:\n• Warm-up (5-10 min)\n• Compound lifts (3-4 exercises)\n• Isolation work (2-3 exercises)\n• Cool-down & stretching\n\nExplore our workout programs for detailed plans!"
    }
]


@ai_bp.route("/chat", methods=["POST"])
@token_required
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").lower().strip()
    
    if not message:
        return jsonify({"success": False, "message": "Message is required", "data": None}), 400

    # Match keywords
    matched_response = None
    for item in FITNESS_KNOWLEDGE_BASE:
        if any(kw in message for kw in item["keywords"]):
            matched_response = item["response"]
            break

    if not matched_response:
        matched_response = (
            "Great question! While I'm still learning, I'd recommend consulting with "
            "Coach Gnaneswar directly for personalized advice. You can book a consultation "
            "through the Appointments section or check our Resources page for fitness guides. "
            "Is there anything else I can help with? 💪"
        )

    return jsonify({
        "success": True,
        "message": "Chat response generated successfully",
        "data": {
            "response": matched_response
        }
    }), 200
