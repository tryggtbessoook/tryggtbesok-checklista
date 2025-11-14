// Fil: /api/process-list.js (Slutgiltig Azure-version)

// Importera Azures bibliotek istället för 'openai'
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

exports.handler = async function(event, context) {
  // Hantera CORS preflight-förfrågan (ingen ändring)
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

  // Kontrollera att det är en POST-förfrågan (ingen ändring)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Endast POST är tillåten' }) };
  }

  // Hämta de NYA miljövariablerna från Netlify
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = process.env.AZURE_OPENAI_KEY;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  // Kontrollera att ALLA nycklar finns
  if (!endpoint || !azureApiKey || !deploymentName) {
    console.error("FATALT FEL: Serverkonfiguration saknas. AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, eller AZURE_OPENAI_DEPLOYMENT_NAME är inte satt!");
    return { statusCode: 500, body: JSON.stringify({ error: "Servern är felkonfigurerad." }) };
  }

  try {
    const body = JSON.parse(event.body);
    const userInput = body.text;
    
    if (!userInput) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Ingen text att bearbeta' }) };
    }

    // Skapa en Azure OpenAI-klient
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    
    const prompt = `Analysera texten. Extrahera ENDAST varorna. Ignorera antal/brus. Spara ordningen. Svara ALLTID med en JSON-array av strängar i ett objekt under nyckeln "items". Exempel: {"items": ["Mjölk", "Ägg"]}. Text: "${userInput}"`;
    
    const messages = [{ role: "user", content: prompt }];

    // Anropa Azure (ser lite annorlunda ut)
    const completion = await client.getChatCompletions(deploymentName, messages, {
      responseFormat: { type: "json_object" }
    });
    
    const resultJson = JSON.parse(completion.choices[0].message.content);
    const varor = resultJson.items || [];

    return {
      statusCode: 200,
      body: JSON.stringify(varor)
    };

  } catch (error) {
    console.error("Fel vid anrop till Azure OpenAI API:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Kunde inte bearbeta din lista just nu med Azure." }) };
  }
};
