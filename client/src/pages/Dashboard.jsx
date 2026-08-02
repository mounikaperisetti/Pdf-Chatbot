import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import pdfService from '../services/pdfService';
import chatService from '../services/chatService';
import Toast from '../components/Common/Toast';
import { 
  FiFileText, 
  FiMessageSquare, 
  FiUpload, 
  FiTrash2, 
  FiArrowRight, 
  FiUserCheck,
  FiCalendar
} from 'react-icons/fi';

const Dashboard = () => {
  const { user, pdfs, activePdf, setActivePdf, fetchPdfs } = useAuth();
  const navigate = useNavigate();

  // Component State
  const [stats, setStats] = useState({
    totalPdfs: 0,
    totalQuestions: 0,
    activeDocName: 'None'
  });
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Refresh pdfs list
        await fetchPdfs();
        
        // Fetch chat history
        const chatHistoryData = await chatService.getHistory();
        
        // Compute stats
        const totalPdfsCount = pdfs.length;
        
        // Total questions asked is sum of all messages sent by 'user' across sessions
        let questionsCount = 0;
        let previewMessages = [];

        if (chatHistoryData.history) {
          chatHistoryData.history.forEach(msg => {
            if (msg.sender === 'user') {
              questionsCount++;
            }

            const associatedPdf = pdfs.find(p => p.id === msg.pdfId);
            previewMessages.push({
              pdfId: msg.pdfId || 'general',
              pdfName: associatedPdf ? associatedPdf.originalName : 'General Conversation',
              lastMessage: msg.text,
              timestamp: new Date(msg.createdAt || Date.now())
            });
          });
        }

        // Sort preview messages by timestamp descending
        previewMessages.sort((a, b) => b.timestamp - a.timestamp);

        setStats({
          totalPdfs: totalPdfsCount,
          totalQuestions: questionsCount,
          activeDocName: activePdf ? activePdf.originalName : 'None'
        });
        
        setRecentChats(previewMessages.slice(0, 3)); // show top 3
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activePdf, pdfs.length]);

  const handleDeletePdf = async (id, name, e) => {
    e.stopPropagation(); // prevent setting active PDF
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await pdfService.deletePdf(id);
      setToast({ message: `"${name}" deleted successfully.`, type: 'success' });
      await fetchPdfs();
    } catch (err) {
      setToast({ message: 'Failed to delete PDF.', type: 'error' });
    }
  };

  const handleSelectPdf = (pdf) => {
    setActivePdf(pdf);
    navigate('/chat');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              Welcome back, {user?.fullName}!
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl">
              Upload a document, select it from your list, and start querying. DocuMind will read it and provide instant answers.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all duration-200"
          >
            <FiUpload className="h-4.5 w-4.5" />
            <span>Upload New PDF</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Total PDFs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Uploads</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FiFileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">{stats.totalPdfs}</p>
          <p className="mt-1.5 text-xs text-slate-400">PDF documents on server</p>
        </div>

        {/* Total Queries */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Questions Asked</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FiMessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-800">{stats.totalQuestions}</p>
          <p className="mt-1.5 text-xs text-slate-400">Queries resolved locally</p>
        </div>

        {/* Selected Context */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Active Document</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FiUserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 truncate text-lg font-bold text-slate-800" title={stats.activeDocName}>
            {stats.activeDocName}
          </p>
          <p className="mt-3.5 text-xs text-slate-400">Selected chat scope</p>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Uploads Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-bold text-slate-800">Recently Uploaded PDFs</h3>
            <Link to="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center space-x-1">
              <span>View all</span>
              <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : pdfs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <FiFileText className="h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-400">No PDFs uploaded yet</p>
                <p className="mt-1 text-xs text-slate-400">Upload documents to start analysis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pdfs.slice(0, 4).map((pdf) => (
                  <div
                    key={pdf.id}
                    onClick={() => handleSelectPdf(pdf)}
                    className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:border-blue-100 hover:bg-blue-50/30 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <FiFileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-slate-700">{pdf.originalName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatFileSize(pdf.fileSize)} • {formatDate(pdf.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeletePdf(pdf.id, pdf.originalName, e)}
                      className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                      title="Delete PDF"
                    >
                      <FiTrash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Chat Preview Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-bold text-slate-800">Recent Chats Preview</h3>
            <Link to="/chat" className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center space-x-1">
              <span>Open Chat</span>
              <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : recentChats.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <FiMessageSquare className="h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-400">No chat history found</p>
                <p className="mt-1 text-xs text-slate-400">Chat sessions are logged when you send messages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentChats.map((chat, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const matchingPdf = pdfs.find(p => p.id === chat.pdfId);
                      if (matchingPdf) setActivePdf(matchingPdf);
                      navigate('/chat');
                    }}
                    className="flex flex-col rounded-xl border border-slate-100 p-4 hover:border-blue-100 hover:bg-slate-50/50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {chat.pdfName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center space-x-1">
                        <FiCalendar className="h-3 w-3" />
                        <span>{chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm text-slate-600 line-clamp-2 italic font-medium">
                      "{chat.lastMessage}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast alerts */}
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

export default Dashboard;
