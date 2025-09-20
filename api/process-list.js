// Fil: /api/process-list.js (Slutgiltig OpenAI-version)
const OpenAI = require('openai');

exports.handler = async function(event, context) {
  // Hantera CORS preflight-förfrågan FÖRST
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // Kontrollera att det är en POST-förfrågan
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Endast POST är tillåten' }) };
  }

  // Kontrollera API-nyckeln
  if (!process.env.OPENAI_API_KEY) {
    console.error("FATALT FEL: Miljövariabeln OPENAI_API_KEY är inte satt!");
    return { statusCode: 500, body: JSON.stringify({ error: "Servern är felkonfigurerad. API-nyckel saknas." }) };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const body = JSON.parse(event.body);
    const userInput = body.text;
    
    if (!userInput) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Ingen text att bearbeta' }) };
    }

    const prompt = `Analysera texten. Extrahera ENDAST varorna. Ignorera antal/brus. Svara ALLTID med en JSON-array av strängar i ett objekt under nyckeln "items". Exempel: {"items": ["Mjölk", "Ägg"]}. Text: "${userInput}"`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    
    const resultJson = JSON.parse(completion.choices[0].message.content);
    const varor = resultJson.items || [];

    return {
      statusCode: 200,
      body: JSON.stringify(varor)
    };

  } catch (error) {
    console.error("Fel vid anrop till OpenAI API:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Kunde inte bearbeta din lista just nu med OpenAI." }) };
  }
};
