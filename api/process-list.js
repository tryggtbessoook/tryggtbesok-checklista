// Fil: api/process-list.js (Den slutgiltiga, mest robusta versionen)

const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Sätt headers för att tillåta anrop från alla webbplatser.
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Hantera OPTIONS-förfrågan som webbläsare skickar automatiskt
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Första, kritiska kontrollen: Finns API-nyckeln överhuvudtaget?
  if (!process.env.GEMINI_API_KEY) {
    console.error("FATALT FEL: Miljövariabeln GEMINI_API_KEY är inte satt på Vercel!");
    return res.status(500).json({ error: "Servern är felkonfigurerad. API-nyckel saknas." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const userInput = req.body.text;
    if (!userInput) {
      return res.status(400).json({ error: 'Ingen text att bearbeta' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `
      Du är en expertassistent för att skapa inköpslistor. Analysera följande text som en användare har skrivit.
      Extrahera ENDAST de faktiska varorna. Ignorera antal, märken, kommentarer och allt annat brus.
      Svara ALLTID med enbart en JSON-array av strängar, där varje sträng är en vara.
      Exempel: Om texten är "2 liter mjölk och ägg", ska du svara med ["Mjölk", "Ägg"].
      Här är texten: "${userInput}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n/g, '').replace(/\n```/g, '').trim();

    return res.status(200).json(JSON.parse(text));

  } catch (error) {
    // Om något annat går fel (t.ex. ogiltig nyckel från Google), logga det.
    console.error("Ett fel inträffade i API-funktionen:", error);
    return res.status(500).json({ error: "Kunde inte bearbeta din lista just nu. API-nyckeln kan vara ogiltig eller så har projektet inte rätt behörigheter i Google Cloud." });
  }
};
