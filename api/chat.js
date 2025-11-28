import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS headers pour autoriser les requêtes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Autoriser uniquement POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { message, coursContent } = req.body;
    
    const prompt = `Tu es un assistant pédagogique pour des étudiants en droit. Réponds uniquement en te basant sur le contenu de cours fourni. Si la question ne concerne pas le cours, indique poliment que tu ne peux répondre qu'aux questions liées au cours.

Contenu du cours :
${coursContent}

Question de l'étudiant : ${message}

Réponds de manière claire, pédagogique et en français.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Erreur Gemini:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération de la réponse',
      details: error.message 
    });
  }
}
