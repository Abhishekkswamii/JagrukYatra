const apiKey = process.env.GEMINI_API_KEY;
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    const textModels = data.models
      .filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('pro'))
      .map(m => m.name);
    console.log(textModels);
  });
