// Fil: /api/process-list.js (Slutgiltig OpenAI-version)
const OpenAI = require('openai');

module.exports = async (req, res) => {
  // Hantera CORS och preflight-förfrågan FÖRST
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Kontrollera att det är en POST-förfrågan
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Endast POST är tillåten' });
  }

  // FÖRST NU, KONTROLLERA API-NYCKELN
  if (!process.env.OPENAI_API_KEY) {
    console.error("FATALT FEL: Miljövariabeln OPENAI_API_KEY är inte satt!");
    return res.status(500).json({ error: "Servern är felkonfigurerad. API-nyckel saknas." });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const userInput = req.body.text;
    if (!userInput) {
      return res.status(400).json({ error: 'Ingen text att bearbeta' });
    }

    const prompt = `Analysera texten. Extrahera ENDAST varorna. Ignorera antal/brus. Svara ALLTID med en JSON-array av strängar i ett objekt under nyckeln "items". Exempel: {"items": ["Mjölk", "Ägg"]}. Text: "${userInput}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    
    const resultJson = JSON.parse(completion.choices[0].message.content);
    const varor = resultJson.items || [];

    return res.status(200).json(varor);

  } catch (error) {
    console.error("Fel vid anrop till OpenAI API:", error);
    return res.status(500).json({ error: "Kunde inte bearbeta din lista just nu med OpenAI." });
  }
};
