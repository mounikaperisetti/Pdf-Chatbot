const pdfParse = require('pdf-parse');

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
  'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
  'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', "shan't", 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
  'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres',
  'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
  'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
  'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
  'your', 'yours', 'yourself', 'yourselves'
]);

const searchService = {
  async extractText(fileBuffer) {
    try {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } catch (error) {
      console.error('Error parsing PDF text:', error);
      throw new Error('Failed to parse PDF document.');
    }
  },

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word && !STOP_WORDS.has(word));
  },

  segmentText(text) {
    if (!text) return [];
    
    const lines = text.split(/\n/);
    const paragraphs = [];
    let currentParagraph = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
      } else {
        currentParagraph.push(trimmed);
      }
    }
    
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs
      .map(p => p.trim())
      .filter(p => p.length > 15);
  },

  checkConversational(query) {
    const cleaned = query.toLowerCase().trim().replace(/[^\w\s]/g, '');

    const greetings = ['hello', 'hi', 'hey', 'greetings', 'hola'];
    if (greetings.includes(cleaned)) {
      return "Hello! How can I help you today? Please upload a PDF and ask questions about its content!";
    }

    if (['hi what can you do', 'what can you do', 'what do you do'].includes(cleaned)) {
      return "I can help you chat with uploaded PDFs, compare multiple documents, summarize content, and tailor a resume against a job description.";
    }

    if (['how do i upload a pdf', 'how to upload a pdf', 'how do i upload pdf'].includes(cleaned)) {
      return "Use the Upload PDFs button in this chat, or open the Upload page. You can select one PDF or multiple PDFs, then ask questions about them here.";
    }

    if (cleaned === 'good morning') {
      return "Good morning! I hope you're having a great start to your day. How can I help you with your PDF documents?";
    }

    if (cleaned === 'good afternoon') {
      return "Good afternoon! How can I assist you with your document parsing today?";
    }

    if (cleaned === 'good evening') {
      return "Good evening! Need some help analyzing or searching through a PDF? Ask away!";
    }

    if (['thank you', 'thanks', 'thank you so much'].includes(cleaned)) {
      return "You're very welcome! I'm glad I could help.";
    }

    if (['bye', 'goodbye', 'see you'].includes(cleaned)) {
      return "Goodbye! Have a wonderful day, and let me know if you need to analyze more files in the future.";
    }

    if (['how are you', 'how are you doing'].includes(cleaned)) {
      return "I'm functioning perfectly, thank you for asking! Ready to parse some PDFs. What about you?";
    }

    const emotionalResponses = [
      {
        words: ['sad', 'upset', 'depressed', 'lonely', 'stressed', 'anxious', 'worried'],
        response: "I'm sorry you're feeling that way. I'm here with you. You can talk to me, or we can focus on a PDF together if that helps."
      },
      {
        words: ['happy', 'excited', 'great', 'awesome', 'good'],
        response: "That's great to hear! I'm ready whenever you want to upload a PDF or ask a question."
      },
      {
        words: ['angry', 'frustrated', 'annoyed'],
        response: "That sounds frustrating. Let's take it one step at a time. Ask me anything, or upload a PDF and I'll help you work through it."
      }
    ];

    for (const item of emotionalResponses) {
      if (item.words.some(word => cleaned.includes(word))) {
        return item.response;
      }
    }

    return null;
  },

  searchPdf(pdfText, question) {
    const conversationalResponse = this.checkConversational(question);
    if (conversationalResponse) {
      return conversationalResponse;
    }

    if (!pdfText || pdfText.trim() === '') {
      return "The uploaded PDF does not contain enough text information to search.";
    }

    // Remove the labels added while combining multiple PDFs, otherwise fallback search may return them.
    const paragraphs = this.segmentText(pdfText).filter(paragraph => {
      const cleaned = paragraph.trim();
      return cleaned &&
        !cleaned.startsWith("==========================") &&
        !/^PDF\s+\d+/i.test(cleaned) &&
        !/^Name:/i.test(cleaned);
    });
    if (paragraphs.length === 0) {
      return "The uploaded PDF does not contain enough information to answer this question.";
    }

    const queryTokens = this.tokenize(question);
    if (queryTokens.length === 0) {
      return "Please enter a specific question about the document.";
    }

    let bestParagraph = '';
    let highestScore = 0;

    for (const paragraph of paragraphs) {
      const paraTokens = this.tokenize(paragraph);
      const paraTokenSet = new Set(paraTokens);

      if (paraTokenSet.size === 0) continue;

      let matchCount = 0;
      for (const token of queryTokens) {
        if (paraTokenSet.has(token)) {
          matchCount++;
        }
      }

      let keywordIntersection = matchCount / queryTokens.length;
      
      const cleanedPara = paragraph.toLowerCase();
      const cleanedQuestion = question.toLowerCase().replace(/[^\w\s]/g, '');
      
      if (cleanedPara.includes(cleanedQuestion)) {
        keywordIntersection += 0.5;
      } else {
        // Bigrams help when a phrase matters more than a single keyword.
        for (let i = 0; i < queryTokens.length - 1; i++) {
          const bigram = `${queryTokens[i]} ${queryTokens[i+1]}`;
          if (cleanedPara.includes(bigram)) {
            keywordIntersection += 0.1;
          }
        }
      }

      if (keywordIntersection > highestScore) {
        highestScore = keywordIntersection;
        bestParagraph = paragraph;
      }
    }

    // Keep fallback from returning unrelated paragraphs on weak matches.
    const THRESHOLD = 0.15;

    if (highestScore >= THRESHOLD && bestParagraph) {
      return bestParagraph;
    }

    return "The uploaded PDF does not contain enough information to answer this question.";
  }
};

module.exports = searchService;
