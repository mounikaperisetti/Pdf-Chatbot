import React, { useState, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import chatService from '../services/chatService';
import pdfService from '../services/pdfService';
import Toast from '../components/Common/Toast';
import { 
  FiSend, 
  FiFileText, 
  FiTrash2, 
  FiMessageSquare, 
  FiHelpCircle,
  FiUploadCloud
} from 'react-icons/fi';

const Chat = () => {
  const { pdfs, activePdf, setActivePdf, fetchPdfs } = useAuth();
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPdfIds, setSelectedPdfIds] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Feedback / Ref State
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activePdf && !selectedPdfIds.includes(activePdf.id)) {
      setSelectedPdfIds([activePdf.id]);
    }
  }, [activePdf]);

  useEffect(() => {
    setSelectedPdfIds(prev => prev.filter(id => pdfs.some(pdf => pdf.id === id)));
  }, [pdfs]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history for active context
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      const contextId = selectedPdfIds[0] || 'general';
      try {
        const historyData = await chatService.getHistory(contextId);
        if (historyData.history) {
          setMessages(historyData.history.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.createdAt || msg.timestamp
          })));
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setToast({ message: 'Could not load chat history.', type: 'error' });
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedPdfIds]);

  // Scroll whenever messages state or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    if (!textToSend) setInputText('');

    // Append user message locally
    const userMsgId = Date.now().toString();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const contextIds = selectedPdfIds;

    try {
      const response = await chatService.chat(contextIds, query);
      
      if (response.message || response.answer) {
        // Append actual AI message returned from server
        setMessages(prev => [...prev, {
          id: response.message?.id || Date.now().toString() + '-ai',
          sender: 'ai',
          text: response.message?.text || response.answer,
          timestamp: new Date(response.message?.timestamp || Date.now())
        }]);
      }
    } catch (err) {
      console.error('Failed to submit question:', err);
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      // Append fallback error locally
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-err',
        sender: 'ai',
        text: serverMessage
          ? `Server error: ${serverMessage}`
          : 'Sorry, I encountered an error communicating with the server. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (messages.length === 0) return;
    if (!window.confirm('Are you sure you want to clear chat history for this session?')) return;

    const contextId = selectedPdfIds[0] || 'general';
    try {
      await chatService.deleteHistory(contextId);
      setMessages([]);
      setToast({ message: 'Session history cleared successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to clear chat history.', type: 'error' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSuggestedQuestions = () => {
    if (selectedPdfIds.length >= 2) {
      return [
        'Compare these documents.',
        'Tailor my resume according to this JD.',
        'What skills are missing from my resume?'
      ];
    }

    if (selectedPdfIds.length === 1) {
      return [
        'Summarize this document.',
        'What are the key points in this PDF?',
        'What is this document about?'
      ];
    }
    return [
      'Hi, what can you do?',
      'How do I upload a PDF?',
      'How are you doing?'
    ];
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const selectedPdfs = pdfs.filter(pdf => selectedPdfIds.includes(pdf.id));

  const togglePdfSelection = (pdf) => {
    setSelectedPdfIds(prev => {
      const exists = prev.includes(pdf.id);
      const next = exists ? prev.filter(id => id !== pdf.id) : [...prev, pdf.id];
      setActivePdf(next.length === 1 ? pdfs.find(item => item.id === next[0]) || null : null);
      return next;
    });
  };

  const validatePdfFile = (file) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return `"${file.name}" is not a PDF file.`;
    }

    if (file.size > 15 * 1024 * 1024) {
      return `"${file.name}" is larger than 15MB.`;
    }

    return null;
  };

  const handleChatUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (files.length === 0) return;

    const validationError = files.map(validatePdfFile).find(Boolean);
    if (validationError) {
      setToast({ message: validationError, type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedPdfs = [];

      for (const file of files) {
        const response = await pdfService.uploadPdf(file);
        if (response.pdf) {
          uploadedPdfs.push(response.pdf);
        }
      }

      await fetchPdfs();

      const uploadedIds = uploadedPdfs.map(pdf => pdf.id);
      setSelectedPdfIds(prev => [...new Set([...prev, ...uploadedIds])]);

      if (uploadedPdfs.length === 1) {
        setActivePdf(uploadedPdfs[0]);
      } else {
        setActivePdf(null);
      }

      setToast({
        message: `${uploadedPdfs.length} PDF${uploadedPdfs.length === 1 ? '' : 's'} uploaded and selected.`,
        type: 'success'
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload one or more PDFs.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-fadeIn">
      
      {/* Header bar inside Chat page */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4.5">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiMessageSquare className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-slate-800">
              {selectedPdfs.length > 0
                ? `Chatting with ${selectedPdfs.length} PDF${selectedPdfs.length === 1 ? '' : 's'}`
                : 'General Chat Session'}
            </h3>
            <p className="text-[10px] font-semibold text-slate-400">
              {selectedPdfs.length > 0
                ? selectedPdfs.map(pdf => pdf.originalName).join(', ')
                : 'Greetings and standard responses'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf"
            multiple
            onChange={handleChatUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            title="Upload PDFs in chat"
          >
            <FiUploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload PDFs'}</span>
          </button>
          <button
            onClick={handleClearHistory}
            disabled={messages.length === 0}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-red-600 disabled:opacity-40 disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all duration-200"
            title="Clear active history"
          >
            <FiTrash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {pdfs.length > 0 && (
        <div className="border-b border-slate-100 bg-white px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {pdfs.map((pdf) => {
              const selected = selectedPdfIds.includes(pdf.id);
              return (
                <button
                  key={pdf.id}
                  type="button"
                  onClick={() => togglePdfSelection(pdf)}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200 hover:text-blue-600'
                  }`}
                  title={pdf.originalName}
                >
                  <FiFileText className="h-4 w-4" />
                  <span className="max-w-[180px] truncate">{pdf.originalName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main chat messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-xs text-slate-400 font-medium">Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiHelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No conversations started yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedPdfs.length > 0 
                  ? `Ask across ${selectedPdfs.length} selected PDF${selectedPdfs.length === 1 ? '' : 's'} or choose a suggested question below.` 
                  : 'Start chatting or upload a PDF document and select it to query its contents.'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`
                  flex max-w-[85%] sm:max-w-[70%] flex-col space-y-1 rounded-2xl px-4 py-3 shadow-sm
                  ${isUser 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-100'}
                `}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  <span className={`text-[9px] font-semibold self-end select-none
                    ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex w-full justify-start animate-pulse">
            <div className="flex flex-col space-y-1 rounded-2xl rounded-tl-none border border-slate-100 bg-slate-100 px-4 py-3.5 shadow-sm">
              <div className="flex items-center space-x-1.5 h-3">
                <div className="typing-dot h-2 w-2 rounded-full bg-slate-400"></div>
                <div className="typing-dot h-2 w-2 rounded-full bg-slate-400"></div>
                <div className="typing-dot h-2 w-2 rounded-full bg-slate-400"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions footer bar */}
      <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50">
        <div className="flex flex-wrap gap-2">
          {getSuggestedQuestions().map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isTyping || loadingHistory}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all duration-150"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message input bar */}
      <div className="border-t border-slate-100 p-4 bg-white">
        <div className="flex items-center space-x-3">
          <textarea
            rows="1"
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-slate-400"
            placeholder={selectedPdfIds.length > 0 ? "Ask about the selected PDFs..." : "Type general greetings or upload PDFs..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isTyping}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FiSend className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Chat;
