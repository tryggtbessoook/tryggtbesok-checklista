// Fil: /api/process-list.js (Diagnostisk Test-version)

// Denna funktion anropar INTE Google AI.
module.exports = async (req, res) => {
  // Sätt standard-headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userInput = req.body.text;
    if (!userInput) {
      return res.status(400).json({ error: 'Ingen text att bearbeta' });
    }

    // Istället för att anropa AI, skickar vi bara tillbaka texten inuti en array.
    // Detta simulerar det format AI:n skulle ha skickat.
    const echoResponse = [userInput];

    // Skicka tillbaka eko-svaret
    return res.status(200).json(echoResponse);

  } catch (error) {
    // Om något går fel här, är det ett grundläggande serverfel.
    console.error("Fel i test-funktionen:", error);
    return res.status(500).json({ error: "Ett fel inträffade i test-funktionen." });
  }
};
