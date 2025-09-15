// Fil: /api/process-list.js (Diagnostisk version)

// Denna funktion ska bara rapportera vad den ser.
module.exports = async (req, res) => {
  // Standard-headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Hämta alla miljövariabler som funktionen har tillgång till
    const allVariables = Object.keys(process.env);

    // Kontrollera specifikt om vår nyckel finns
    const hasApiKey = allVariables.includes('GEMINI_API_KEY');
    
    // Om nyckeln finns, visa de 4 första och 4 sista tecknen för att verifiera
    let apiKeyPreview = "Nyckel ej funnen";
    if (hasApiKey) {
      const key = process.env.GEMINI_API_KEY;
      apiKeyPreview = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    }

    // Skapa ett diagnostiskt svar
    const diagnosticInfo = {
      message: "Detta är en diagnostisk rapport från servern.",
      hasApiKey: hasApiKey,
      apiKeyPreview: apiKeyPreview,
      variableCount: allVariables.length,
      allVariables: allVariables, // Lista alla variabelnamn
    };

    // Skicka tillbaka rapporten
    return res.status(200).json(diagnosticInfo);

  } catch (error) {
    console.error("Fel i diagnostik-funktionen:", error);
    return res.status(500).json({ error: "Ett fel inträffade i diagnostik-funktionen.", details: error.message });
  }
};
