import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Groq from 'groq-sdk'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

// --- CONFIGURATION ---
 
const GROQ_API_KEY = process.env.GROQ_API_KEY;
let groq;
if (GROQ_API_KEY && !GROQ_API_KEY.startsWith("YOUR_")) {
  groq = new Groq({ apiKey: GROQ_API_KEY });
}

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// --- Schemas ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
});

const transactionSchema = new mongoose.Schema({
  userId: String,
  to: String,
  amount: Number,
  type: String,
  category: String,
  date: String,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// --- HELPER: Clean AI JSON ---
const cleanJSON = (text) => {
  if (!text) return null;
  return text.replace(/```json\n?|```/g, '').trim();
};

// --- ROUTES ---

// Standard Auth/Payment Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email exists" });
    const user = await User.create({ name, email, password, balance: 0 });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ error: "Invalid credentials" });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const txs = await Transaction.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json({ balance: user.balance, transactions: txs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/pay', async (req, res) => {
  try {
    const { userId, payId, amount, category } = req.body;
    const user = await User.findById(userId);
    if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });
    user.balance -= Number(amount);
    await user.save();
    const tx = await Transaction.create({ userId, to: payId, amount, type: "debit", category, date: new Date().toISOString().split('T')[0] });
    res.json({ success: true, newBalance: user.balance, transaction: tx });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deposit', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    user.balance += Number(amount);
    await user.save();
    const tx = await Transaction.create({ userId, to: "Deposit", amount, type: "credit", category: "Income", date: new Date().toISOString().split('T')[0] });
    res.json({ success: true, newBalance: user.balance, transaction: tx });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. AI Advice Route (AI Estimates Growth Percentage)
app.post('/api/advice', async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });

    // 1. Prepare Data for AI
    // We send the last 15 transactions so the AI can see the "trend"
    const txSummary = transactions.slice(0, 15).map(t => 
      `${t.date}: ${t.type === 'credit' ? '+' : '-'}${t.amount} (${t.category})`
    ).join('\n');

    const prompt = `
      Current Balance: ₹${user.balance}
      Recent Transactions:
      ${txSummary}

      Analyze the user's financial health and estimate a "monthly growth rate" for their savings.
      - If they have good saving habits, give a positive decimal (e.g. 0.05 for 5% growth).
      - If they overspend, give a negative decimal (e.g. -0.03 for -3% loss).
      - Be realistic based on the transaction history.
      - give an indepth analysis of their spending habits, a specific actionable savings tip, and a prediction for their balance next month.
      - also tell them in depth actionable steps to improve their financial health.

      Provide strict JSON with exactly these 4 keys (no markdown):
      1. "analysis": Brief analysis of spending habits (max 1 sentence).
      2. "tip": A specific actionable savings tip.
      3. "prediction": A prediction for next month.
      4. "growthRate": A number representing the estimated monthly growth rate (e.g. 0.04).
    `;

    // 2. Get AI Response
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" } 
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    
    // Fallback to 0% if AI forgets the key
    const rate = aiResponse.growthRate || 0; 

    // 3. Generate Graph Data using AI's Rate
    const forecast = [];
    let currentProjBalance = user.balance;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIndex = new Date().getMonth();

    for (let i = 0; i < 6; i++) {
      const nextMonthIndex = (currentMonthIndex + i + 1) % 12;
      
      // Apply the AI's estimated percentage
      currentProjBalance = currentProjBalance * (1 + rate);
      
      // Prevent negative numbers for the chart (optional)
      if (currentProjBalance < 0) currentProjBalance = 0;

      forecast.push({
        month: monthNames[nextMonthIndex],
        balance: Math.round(currentProjBalance)
      });
    }

    // 4. Send everything back to frontend
    res.json({
      ...aiResponse, // Contains analysis, tip, prediction
      forecast: forecast 
    });

  } catch (error) {
    console.error("Advice Error:", error);
    res.status(500).json({ error: "Failed to generate advice" });
  }
});
// --- 7. AI Chatbot Route (Context-Aware) ---
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;

  try {
    // 1. Fetch User Context (Balance + Recent Transactions)
    const user = await User.findById(userId);
    // Get last 20 transactions for context
    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20); 

    // 2. Format Context for the AI
    const txContext = transactions.map(t => 
      `- ${t.date}: ${t.type} of ₹${t.amount} for ${t.category} (to/from: ${t.to})`
    ).join('\n');

    const systemPrompt = `
      You are a smart financial assistant for a user named ${user.name}.
      
      USER CONTEXT:
      - Current Balance: ₹${user.balance}
      - Recent Transactions (Last 20):
      ${txContext}

      INSTRUCTIONS:
      - Answer the user's question based strictly on the provided transaction history.
      - If they ask about spending, calculate totals from the list above.
      - Be concise, friendly, and encouraging.
      - Use formatting like bolding for numbers (e.g., **₹500**).
      - If the answer isn't in the data, say you don't see that record.
    `;

    // 3. Call Groq AI
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ reply: aiResponse });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Chat functionality unavailable" });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});