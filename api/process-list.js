// Fil: /api/process-list.js

// Importera Googles AI-bibliotek
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Skapa en ny instans av AI:n med vår hemliga nyckel
// process.env.GEMINI_API_KEY hämtar nyckeln från en säker plats på Vercel (se Steg 6)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Huvudfunktionen som tar emot anrop från vår app
export default async function handler(req, res) {
  // Tillåt anrop från vår egen webbplats för säkerhetsskäl
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Om webbläsaren skickar en "OPTIONS"-förfrågan, svara bara OK
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OPTIONS received' });
  }
  
  // Vi förväntar oss en POST-förfrågan med text
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Endast POST-metoden är tillåten' });
  }

  // Hämta den röriga texten från appens anrop
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: 'Ingen text att bearbeta' });
  }

  try {
    // Välj AI-modell
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // === Prompten: Hur vi instruerar AI:n ===
    const prompt = `
      Du är en expertassistent för att skapa inköpslistor. Analysera följande text som en användare har skrivit.
      Extrahera ENDAST de faktiska varorna. Ignorera antal, märken, kommentarer och allt annat brus.
      Svara ALLTID med enbart en JSON-array av strängar, där varje sträng är en vara.
      Exempel: Om texten är "2 liter mjölk och ägg", ska du svara med ["Mjölk", "Ägg"].
      Här är texten: "${userInput}"
    `;

    // Skicka prompten till Gemini och vänta på svar
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Rensa upp svaret för att säkerställa att det är ren JSON
    text = text.replace(/```json\n/g, '').replace(/\n```/g, '');

    // Skicka den rena, strukturerade listan tillbaka till vår app
    res.status(200).json(JSON.parse(text));

  } catch (error) {
    console.error("Fel vid anrop till Gemini API:", error);
    res.status(500).json({ error: "Kunde inte bearbeta din lista just nu." });
  }
}
