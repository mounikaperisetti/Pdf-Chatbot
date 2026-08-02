import React, { useState, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import pdfService from '../services/pdfService';
import Toast from '../components/Common/Toast';
import { 
  FiUploadCloud, 
  FiFileText, 
  FiTrash2, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiInfo 
} from 'react-icons/fi';

const Upload = () => {
  const { pdfs, fetchPdfs, setActivePdf } = useAuth();
  
  // Local Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Toast / Feedback State
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setToast({ message: 'Invalid file format. Please upload PDF files only.', type: 'error' });
      setSelectedFile(null);
      return;
    }
    
    // Size limit check (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setToast({ message: 'File is too large. Maximum allowed size is 15MB.', type: 'error' });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await pdfService.uploadPdf(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      setToast({ message: 'PDF uploaded and parsed successfully!', type: 'success' });
      setSelectedFile(null);
      setUploadProgress(0);

      // Refresh files list
      await fetchPdfs();

      // Automatically set uploaded PDF as active PDF context
      if (response.pdf) {
        setActivePdf(response.pdf);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error occurred during file processing. Please try again.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePdf = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await pdfService.deletePdf(id);
      setToast({ message: `"${name}" has been deleted.`, type: 'success' });
      await fetchPdfs();
    } catch (err) {
      setToast({ message: 'Failed to delete PDF file.', type: 'error' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upload Container Zone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Upload New Document</h3>
            <p className="text-sm text-slate-500 mb-6">
              Add a new PDF file to your account. DocuMind will parse the text and enable chatting.
            </p>

            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`
                flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 min-h-[220px]
                ${dragActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'}
                ${isUploading ? 'pointer-events-none opacity-60' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <FiUploadCloud className="h-6 w-6 animate-pulse" />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Drag and drop your PDF here, or <span className="text-blue-600 hover:text-blue-500">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1.5">Only PDF documents up to 15MB are accepted</p>
            </div>

            {/* File Selected / Progress Display */}
            {selectedFile && (
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FiFileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="truncate text-sm font-semibold text-slate-700">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  
                  {!isUploading && (
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                {isUploading && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Extracting and uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action button */}
                {!isUploading && (
                  <button
                    onClick={handleUploadSubmit}
                    className="mt-4 flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Process PDF
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Existing files list side panel */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col min-h-[380px]">
            <h3 className="font-bold text-slate-800 mb-1">Your Documents</h3>
            <p className="text-xs text-slate-400 mb-4">{pdfs.length} files parsed</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {pdfs.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-12">
                  <FiInfo className="h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-400">No PDFs uploaded yet.</p>
                </div>
              ) : (
                pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <FiFileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="truncate text-xs font-semibold text-slate-700" title={pdf.originalName}>
                          {pdf.originalName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatFileSize(pdf.fileSize)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePdf(pdf.id, pdf.originalName)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                      title="Delete document"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
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

export default Upload;
