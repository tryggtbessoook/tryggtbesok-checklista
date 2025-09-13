

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Endast POST-metoden är tillåten' });
  }

  const userInput = req.body.text;
  if (!userInput) {
    return res.status(400).json({ error: 'Ingen text att bearbeta' });
  }

  try {
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

    res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Fel vid anrop till Gemini API:", error);
    res.status(500).json({ error: "Kunde inte bearbeta din lista just nu." });
  }
};
