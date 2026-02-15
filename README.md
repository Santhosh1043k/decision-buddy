# 🧠 Decision Coach
> **Make better decisions with clarity, emotional awareness, and structured analysis.**
Decision Coach is a thoughtful web application that guides you through a structured decision-making process, combining logical analysis with emotional intelligence.
---
## ✨ What is Decision Coach?
Decision fatigue is real. When facing important choices—whether it's a career move, a major purchase, or a life transition—our emotions and cognitive biases often cloud our judgment.
**Decision Coach helps you:**
- 🎯 Clarify what truly matters to you
- 📝 Structure your options systematically
- 💭 Understand your emotional responses
- 📊 Compare options with weighted scoring
- 💾 Save and revisit your decision analyses
---
## 🚀 Features
### Phase 1: Decision Templates ✅
Start with confidence using pre-built templates:
- **Career** - "Should I accept this job offer?"
- **Financial** - "Should I buy a house or keep renting?"
- **Relationships** - "Should I move in with my partner?"
- **Lifestyle** - "Should I relocate to a new city?"
- **Health** - "Should I switch to a different workout routine?"
Each template comes with relevant priorities pre-configured.
### Phase 2: Pros, Cons & Confidence ✅
- **Pros & Cons Analysis** - List advantages and disadvantages for each option
- **Confidence Scoring** - Rate how confident you feel (1-10)
- **Contextual Prompts** - Get guided questions based on your decision type
- **Reflection Notes** - Document your reservations and thoughts
### Core Features
- 🔐 **User Authentication** - Secure login with Supabase Auth
- 💾 **Decision History** - Save and revisit past decisions
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Beautiful UI** - Clean, minimal design with smooth animations
- 🌙 **Dark Mode Support** - Easy on the eyes, day or night
---
## 📖 How to Use
### 1. Getting Started
```bash
# Clone the repository
git clone https://github.com/Santhosh1043k/decision-buddy.git
# Navigate to project
cd decision-buddy
# Install dependencies
npm install
# Start development server
npm run dev
2. Configuration
Create a .env file in the root directory:

env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
# OpenAI Configuration (Optional - for AI-powered insights)
VITE_OPENAI_API_KEY=your_openai_api_key_here
3. The Decision-Making Process
Step 1: Define Your Decision
Enter your decision question (e.g., "Should I move to a new city?")
Or choose from Decision Templates for common scenarios
Step 2: List Your Options
Add all possible options you're considering
Include your emotional thoughts about each option
Step 3: Add Pros & Cons
For each option, list advantages (pros) and disadvantages (cons)
Helps clarify your thinking beyond just emotions
Step 4: Set Your Priorities
Define what factors matter most (Money, Happiness, Growth, etc.)
Weight each priority by importance (1-5 scale)
Step 5: Rate Each Option
Score each option against every priority (0-5 scale)
Step 6: Confidence Check
Rate your confidence in the decision (1-10)
Note any remaining reservations
Step 7: View Results
See your Logical Analysis with weighted scores
Read your Emotional Insights
Review Detected Patterns
Check the Rankings with visual progress bars
Step 8: Save & Track
Save decisions to your dashboard
Revisit them anytime
🛠️ Tech Stack
Category	Technology
Frontend	React 18 + TypeScript
Build Tool	Vite
Styling	Tailwind CSS
UI Components	shadcn/ui
Animations	Framer Motion
Backend	Supabase
📊 How the Scoring Works
Weighted Scoring Algorithm
Score = Σ (Option_Rating × Priority_Weight)
Example:

Option: "Accept Job Offer"
Priority: "Salary" (Weight: 5)
Your Rating: 4/5
Weighted Score: 4 × 5 = 20 points
Emotional Analysis
The app detects emotions from your text:

Emotion	Example Keywords
😰 Fear	worried, anxious, "what if", risky
🤩 Excitement	thrilled, eager, "can't wait", amazing
😔 Guilt	guilty, selfish, "should", obligation
😌 Relief	relieved, free, peaceful, "weight off"
🤔 Uncertainty	unsure, confused, torn, "don't know"
🐛 Troubleshooting
Error: slm.ts syntax error
If you see an error about slm.ts:

Fix:

bash
# Delete the problematic file
del "src\lib\slm.ts"    # Windows
# OR
rm src/lib/slm.ts       # Mac/Linux
# Restart dev server
npm run dev
Phases 1 & 2 work perfectly without this file!

Environment Variables Not Loading
Make sure your .env file is in the project root:

decision-buddy/
├── .env              ✅ Correct
├── src/
└── ...
🚧 Roadmap
Phase 1: Foundation ✅
 Decision templates
 Draft autosave
Phase 2: Enhanced Analysis ✅
 Pros & cons
 Confidence scoring
Phase 3: AI Insights (In Progress)
 OpenAI-powered analysis
 Smart suggestions
Phase 4: Outcome Tracking
 "Sleep on it" reminders
 Decision journal
📄 License
MIT License

Built with ❤️ for better decision-making

```
📝 Quick Setup for Your Local Machine
Since you're having issues with slm.ts, here's what to do:

Step 1: Delete the Problem File
bash
# In your project folder (C:\Program Files\Project\ssss\decision-buddy)
del "src\lib\slm.ts"
Step 2: Create the README
Create README.md in your project root with the content above.

Step 3: Restart Dev Server
bash
npm run dev
✅ What's Working Right Now
Phases 1 & 2 are complete and fully functional:

✅ Decision templates
✅ Pros & Cons analysis
✅ Confidence scoring
✅ Emotion detection
✅ Decision history
✅ Draft autosave
You don't need Phase 3 (AI/OpenAI) for the app to work great!
