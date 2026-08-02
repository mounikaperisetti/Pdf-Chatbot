const makePrompt = (pdfText, question) => {
  const limitedText = pdfText.length > 35000
    ? pdfText.slice(0, 35000)
    : pdfText;

  return `
You are a PDF chatbot.

First understand the PDF text given below.

For direct questions, summaries, key points, definitions, comparisons, or details from the PDF:
- Answer mainly from the PDF text.
- If the answer is not present, say the uploaded documents do not contain enough information.

For questions asking for examples, real-time examples, practical uses, applications, advantages, interview-style explanation, or simple explanation:
- Use the PDF topic as the base.
- You may add general real-world examples related to that topic.
- If those examples are not directly mentioned in the PDF, clearly say:
  "These examples are not directly mentioned in the PDF, but based on the topic, here are some real-time examples:"
- Keep the answer clear and useful.

If there are many PDFs, use all of them and compare when needed.

PDF TEXT:
${limitedText}

QUESTION:
${question}
`;
};

const askGemini = async (pdfText, question) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("Gemini API key missing");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const result = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: makePrompt(pdfText, question)
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200
      }
    })
  });

  const data = await result.json();

  if (!result.ok) {
    throw new Error(data?.error?.message || "Gemini API error");
  }

  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!answer.trim()) {
    throw new Error("Empty response from Gemini");
  }

  return answer.trim();
};

module.exports = {
  askGemini
};
