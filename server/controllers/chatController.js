const dbService = require("../services/dbService");
const searchService = require("../services/searchService");
const aiService = require("../services/aiService");

const saveHistorySafely = async (userId, pdfId, question, answer) => {
  let userMessage = null;
  let aiMessage = {
    id: Date.now().toString(),
    userId,
    pdfId,
    sender: "ai",
    text: answer
  };

  try {
    userMessage = await dbService.saveChatMessage(userId, pdfId, "user", question);
    aiMessage = await dbService.saveChatMessage(userId, pdfId, "ai", answer);
  } catch (historyError) {
    // Chat should still respond even if history saving has a temporary DB issue.
    console.error("Chat history save failed:", historyError.message);
  }

  return { userMessage, aiMessage };
};

const chatWithPDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pdfIds, pdfId, question } = req.body;
    const selectedPdfIds = Array.isArray(pdfIds) ? pdfIds : (pdfId ? [pdfId] : []);

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "question is required"
      });
    }

    const conversationalAnswer = searchService.checkConversational(question);

    if (conversationalAnswer) {
      const historyPdfId = selectedPdfIds[0] || null;
      const { userMessage, aiMessage } = await saveHistorySafely(
        userId,
        historyPdfId,
        question,
        conversationalAnswer
      );

      return res.status(200).json({
        answer: conversationalAnswer,
        message: {
          ...aiMessage,
          timestamp: new Date().toISOString()
        },
        userMessage,
        usedPdfIds: selectedPdfIds
      });
    }

    if (selectedPdfIds.length === 0) {
      return res.status(400).json({
        message: "Please select or upload a PDF before asking document questions."
      });
    }

    // User ID is included in this query so one user cannot read another user's PDFs.
    const pdfs = await dbService.findPdfsByIds(selectedPdfIds, userId);

    if (!pdfs || pdfs.length === 0) {
      return res.status(404).json({
        message: "No PDFs found for given IDs"
      });
    }

    let combinedText = "";

    pdfs.forEach((pdf, index) => {
      combinedText += `
==========================
PDF ${index + 1}
Name: ${pdf.originalName}

${pdf.extractedText || ""}

`;
    });

    let answer = "";

    try {
      answer = await aiService.askGemini(combinedText, question);
    } catch (aiError) {
      // Fallback keeps the chatbot usable if API quota, key, or internet fails.
      console.error("AI API failed, using local search fallback:", aiError.message);
      answer = searchService.searchPdf(combinedText, question);
    }

    const { userMessage, aiMessage } = await saveHistorySafely(
      userId,
      selectedPdfIds[0],
      question,
      answer
    );

    return res.status(200).json({
      answer,
      message: {
        ...aiMessage,
        timestamp: new Date().toISOString()
      },
      userMessage,
      usedPdfIds: selectedPdfIds
    });
  } catch (error) {
    return res.status(500).json({
      message: "Chat error",
      error: error.message
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const pdfId = req.query.pdfId;

    const history = await dbService.getChatHistory(userId, pdfId);

    return res.status(200).json({ history });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching history",
      error: error.message
    });
  }
};

const deleteChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const pdfId = req.query.pdfId;

    await dbService.deleteChatHistory(userId, pdfId);

    return res.status(200).json({
      message: "Deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting history",
      error: error.message
    });
  }
};

module.exports = {
  chatWithPDF,
  getChatHistory,
  deleteChatHistory
};
