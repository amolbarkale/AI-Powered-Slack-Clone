
import React from 'react';
import { X, Download, ExternalLink, File, Image, Video, Music, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { FileAttachment } from '../../contexts/ChatContext';

interface FilePreviewProps {
  file: FileAttachment;
  isOpen: boolean;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={24} className="text-blue-500" />;
    if (type.startsWith('video/')) return <Video size={24} className="text-purple-500" />;
    if (type.startsWith('audio/')) return <Music size={24} className="text-green-500" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText size={24} className="text-red-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <img 
            src={file.url} 
            alt={file.name}
            className="max-h-full max-w-full object-contain rounded"
          />
        </div>
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <video 
            src={file.url} 
            controls
            className="w-full h-full rounded"
          />
        </div>
      );
    }

    if (file.type.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <audio src={file.url} controls className="w-full max-w-md" />
        </div>
      );
    }

    // Default file preview
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {getFileIcon(file.type)}
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getFileIcon(file.type)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)} • Uploaded on {formatDate(file.uploadedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink size={16} className="mr-2" />
              Open
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
          {renderPreview()}
        </div>

        {/* File Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">File Size:</span>
              <p className="text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">File Type:</span>
              <p className="text-gray-600 dark:text-gray-400">{file.type}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Uploaded by:</span>
              <p className="text-gray-600 dark:text-gray-400">{file.uploadedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
