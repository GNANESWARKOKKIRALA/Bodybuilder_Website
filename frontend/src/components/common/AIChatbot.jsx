import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaDumbbell } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const fitnessKB = [
  { keywords: ['hello', 'hi', 'hey', 'start'], response: "Hey there! 💪 I'm your AI Fitness Assistant. I can help with workout advice, nutrition tips, supplement guidance, and more. What would you like to know?" },
  { keywords: ['lose weight', 'weight loss', 'fat loss', 'burn fat'], response: "For effective fat loss:\n\n1. **Caloric Deficit** — Eat 300-500 calories below maintenance\n2. **High Protein** — 1.6-2.2g per kg bodyweight\n3. **Strength Training** — 3-4x per week to preserve muscle\n4. **Cardio** — 2-3 sessions of LISS or HIIT\n5. **Sleep** — 7-9 hours nightly\n\nWant me to recommend a specific plan? Check out our weight loss programs!" },
  { keywords: ['build muscle', 'muscle gain', 'bulk', 'gain weight', 'mass'], response: "To build muscle effectively:\n\n1. **Caloric Surplus** — Eat 300-500 calories above maintenance\n2. **Protein** — 1.8-2.2g per kg bodyweight\n3. **Progressive Overload** — Increase weight/reps weekly\n4. **Compound Movements** — Squat, Deadlift, Bench, Rows\n5. **Rest** — Each muscle group needs 48-72hr recovery\n\nOur muscle building programs are designed for exactly this!" },
  { keywords: ['protein', 'how much protein'], response: "**Protein Recommendations:**\n\n• **General Fitness**: 1.2-1.6g/kg bodyweight\n• **Muscle Building**: 1.8-2.2g/kg bodyweight\n• **Fat Loss**: 2.0-2.4g/kg bodyweight\n• **Competition Prep**: 2.2-2.8g/kg bodyweight\n\nGreat sources: Chicken, Fish, Eggs, Paneer, Whey Protein, Lentils, Greek Yogurt" },
  { keywords: ['supplement', 'supplements', 'creatine', 'whey'], response: "**Essential Supplements:**\n\n1. 🥤 **Whey Protein** — Convenient protein source\n2. 💊 **Creatine Monohydrate** — 5g daily, proven for strength\n3. 🐟 **Fish Oil / Omega-3** — Joint health & recovery\n4. ☀️ **Vitamin D3** — Most people are deficient\n5. 🧲 **Magnesium** — Sleep & recovery\n\nRemember: Supplements are additions to a solid diet, not replacements!" },
  { keywords: ['diet', 'meal plan', 'what to eat', 'nutrition'], response: "**Balanced Nutrition Framework:**\n\n🍽️ **Per Meal Structure:**\n• 1 palm-sized protein source\n• 1 fist-sized carb source\n• 1 thumb-sized fat source\n• 2 fists of vegetables\n\n⏰ **Meal Timing:** 4-6 meals spread evenly\n\nCheck out our custom nutrition plans for a personalized approach!" },
  { keywords: ['workout', 'exercise', 'training', 'routine'], response: "**Recommended Training Splits:**\n\n🏋️ **Beginner**: Full Body 3x/week\n💪 **Intermediate**: Upper/Lower 4x/week\n🔥 **Advanced**: Push/Pull/Legs 6x/week\n\nEach session should include:\n• Warm-up (5-10 min)\n• Compound lifts (3-4 exercises)\n• Isolation work (2-3 exercises)\n• Cool-down & stretching\n\nExplore our workout programs for detailed plans!" },
  { keywords: ['rest', 'recovery', 'sleep', 'overtraining'], response: "**Recovery is WHERE Growth Happens:**\n\n😴 **Sleep**: 7-9 hours (non-negotiable)\n🧘 **Active Recovery**: Light walks, yoga, stretching\n💆 **Stress Management**: Meditation, deep breathing\n🚰 **Hydration**: 3-4 liters daily\n⏸️ **Rest Days**: At least 1-2 per week\n\nSigns of overtraining: persistent fatigue, decreased performance, mood changes" },
  { keywords: ['competition', 'contest', 'compete', 'bodybuilding show'], response: "**Competition Prep Overview:**\n\n📅 Typically 12-20 weeks out:\n• **Phase 1** (12-16 weeks): Gradual calorie reduction, increase cardio\n• **Phase 2** (8-12 weeks): Peak training, refine posing\n• **Phase 3** (4-8 weeks): Final cuts, water/sodium manipulation\n• **Peak Week**: Carb loading, water adjustment, tanning\n\nOur Elite plan includes dedicated competition prep coaching!" },
  { keywords: ['beginner', 'start', 'new', 'first time'], response: "**Welcome to Your Fitness Journey! 🎉**\n\n1. **Start Simple** — 3 days/week full body workouts\n2. **Learn Form** — Master the basics before adding weight\n3. **Track Everything** — Use our app to log workouts & meals\n4. **Be Consistent** — Showing up > perfection\n5. **Get Support** — Consider our Starter plan for guided coaching\n\nThe best workout is the one you actually do!" },
  { keywords: ['cardio', 'running', 'hiit'], response: "**Cardio Guide:**\n\n🚶 **LISS** (Low Intensity): 30-45 min walking/cycling — great for fat loss without muscle loss\n🏃 **HIIT**: 15-20 min intervals — time-efficient, boosts metabolism\n\n**Recommendations:**\n• For fat loss: 3-4 sessions/week\n• For muscle gain: 1-2 light sessions/week\n• Always after weights, not before!" },
  { keywords: ['stretch', 'flexibility', 'mobility', 'warm up'], response: "**Mobility Routine:**\n\n🔥 **Pre-Workout (5-10 min):**\n• Dynamic stretches\n• Band pull-aparts\n• Hip circles\n• Arm circles\n\n🧘 **Post-Workout (10 min):**\n• Static stretches (hold 30sec)\n• Foam rolling\n• Deep breathing\n\nMobility = Longevity in the gym!" },
  { keywords: ['price', 'cost', 'plan', 'membership', 'join'], response: "**Our Plans:**\n\n⭐ **Starter** — ₹999/mo: Basic programs & community\n🌟 **Premium** — ₹2,999/mo: Custom plans & weekly check-ins\n👑 **Elite** — ₹4,999/mo: Full coaching with 24/7 support\n\nAll plans include our progress tracking app! Visit the Pricing page to learn more and start your journey." },
  { keywords: ['thanks', 'thank you', 'helpful'], response: "You're welcome! 😊 Remember, consistency is the key to results. I'm here whenever you need guidance. Keep pushing! 💪🔥" },
];

const getAIResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  for (const item of fitnessKB) {
    if (item.keywords.some(kw => lowerMsg.includes(kw))) {
      return item.response;
    }
  }
  return "Great question! While I'm still learning, I'd recommend consulting with Coach Gnaneswar directly for personalized advice. You can book a consultation through the Appointments section or check our Resources page for fitness guides. Is there anything else I can help with? 💪";
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hey! 👋 I'm your AI Fitness Assistant. Ask me about workouts, nutrition, supplements, or anything fitness-related!", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = getAIResponse(userMsg.content);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const quickActions = [
    'How to lose weight?',
    'Best supplements?',
    'Workout routine',
    'View pricing',
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/30 lg:bottom-8 lg:right-8"
      >
        {isOpen ? (
          <FaTimes className="text-dark-950 text-xl" />
        ) : (
          <FaRobot className="text-dark-950 text-xl" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] glass rounded-2xl flex flex-col shadow-2xl shadow-black/40 overflow-hidden lg:right-8"
          >
            {/* Header */}
            <div className="px-5 py-4 gradient-gold flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-dark-950/20 flex items-center justify-center">
                <HiSparkles className="text-dark-950 text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-dark-950 text-sm">AI Fitness Assistant</h3>
                <p className="text-dark-950/70 text-xs">Powered by GFP Intelligence</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'gradient-gold text-dark-950 rounded-br-md'
                        : 'bg-dark-800 text-dark-200 rounded-bl-md border border-white/5'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-dark-800 rounded-2xl rounded-bl-md px-4 py-3 border border-white/5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => { setInput(action); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 transition-all"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about fitness..."
                  className="input-field !py-3 !rounded-xl text-sm flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-gold-500/20"
                >
                  <FaPaperPlane className="text-dark-950 text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
