import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import pdfService from '../services/pdfService';
import chatService from '../services/chatService';
import Toast from '../components/Common/Toast';
import { 
  FiFileText, 
  FiMessageSquare, 
  FiTrash2, 
  FiSearch, 
  FiEye, 
  FiCalendar, 
  FiDatabase,
  FiClock
} from 'react-icons/fi';

const History = () => {
  const { pdfs, activePdf, setActivePdf, fetchPdfs } = useAuth();
  const navigate = useNavigate();

  // Component State
  const [chatSessions, setChatSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const groupHistoryRows = (rows) => {
    const sessionsByPdf = new Map();

    rows.forEach((row) => {
      const sessionPdfId = row.pdfId || 'general';
      if (!sessionsByPdf.has(sessionPdfId)) {
        sessionsByPdf.set(sessionPdfId, {
          id: sessionPdfId,
          pdfId: sessionPdfId,
          createdAt: row.createdAt,
          messages: []
        });
      }

      const session = sessionsByPdf.get(sessionPdfId);
      session.messages.push({
        id: row.id,
        sender: row.sender,
        text: row.text,
        timestamp: row.createdAt
      });
      session.createdAt = session.createdAt || row.createdAt;
    });

    return Array.from(sessionsByPdf.values());
  };

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      // Fetch pdfs list
      await fetchPdfs();

      // Fetch chat history
      const historyData = await chatService.getHistory();
      if (historyData.history) {
        setChatSessions(groupHistoryRows(historyData.history));
      }
    } catch (err) {
      console.error('Failed to load history list:', err);
      setToast({ message: 'Error loading session logs.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, []);

  const handleDeletePdf = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also wipe its chat history.`)) return;
    try {
      await pdfService.deletePdf(id);
      setToast({ message: `"${name}" deleted.`, type: 'success' });
      await loadHistoryData();
    } catch (err) {
      setToast({ message: 'Failed to delete PDF.', type: 'error' });
    }
  };

  const handleDeleteSession = async (pdfId, title) => {
    if (!window.confirm(`Clear all chat logs for "${title}"?`)) return;
    try {
      await chatService.deleteHistory(pdfId);
      setToast({ message: 'Session history cleared.', type: 'success' });
      await loadHistoryData();
    } catch (err) {
      setToast({ message: 'Failed to clear session history.', type: 'error' });
    }
  };

  const handleOpenChat = (pdfId) => {
    if (pdfId === 'general') {
      setActivePdf(null);
    } else {
      const match = pdfs.find(p => p.id === pdfId);
      if (match) setActivePdf(match);
    }
    navigate('/chat');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter logic
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPdfNameById = (pdfId) => {
    if (pdfId === 'general') return 'General Chat';
    const doc = pdfs.find(p => p.id === pdfId);
    return doc ? doc.originalName : 'Unknown PDF';
  };

  const filteredSessions = chatSessions.filter(session => {
    const pdfName = getPdfNameById(session.pdfId);
    return pdfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            placeholder="Search files or chat messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button
          onClick={loadHistoryData}
          className="inline-flex justify-center items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors"
        >
          <FiClock className="h-4.5 w-4.5 animate-spin-slow" />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* PDFs Catalog card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[500px]">
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FiDatabase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Your Uploaded PDFs</h3>
              <p className="text-xs text-slate-400">Managed documents</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : filteredPdfs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <FiFileText className="h-10 w-10 text-slate-200" />
                <p className="mt-2 text-sm font-medium text-slate-400">No matching files found</p>
              </div>
            ) : (
              filteredPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-4 hover:border-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FiFileText className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="truncate text-sm font-semibold text-slate-700">{pdf.originalName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Size: {formatFileSize(pdf.fileSize)} • Uploaded: {formatDate(pdf.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenChat(pdf.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                      title="Open chat session"
                    >
                      <FiEye className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePdf(pdf.id, pdf.originalName)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
                      title="Delete document"
                    >
                      <FiTrash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversations History card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[500px]">
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FiMessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Past Conversations</h3>
              <p className="text-xs text-slate-400">Archived chat threads</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <FiMessageSquare className="h-10 w-10 text-slate-200" />
                <p className="mt-2 text-sm font-medium text-slate-400">No matching conversations</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const titleName = getPdfNameById(session.pdfId);
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-4 hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FiMessageSquare className="h-6 w-6 text-slate-400 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-slate-700">{titleName}</p>
                        <p className="text-[10px] text-slate-400 font-medium flex items-center space-x-1.5 mt-0.5">
                          <span className="bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                            {session.messages.length} messages
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <FiCalendar className="h-3 w-3" />
                            <span>{formatDate(session.createdAt)}</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenChat(session.pdfId)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
                        title="Resume chat"
                      >
                        <FiEye className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.pdfId, titleName)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
                        title="Clear history"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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

export default History;
