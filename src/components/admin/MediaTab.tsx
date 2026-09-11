import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Loader2,
  FileImage,
  AlertTriangle,
  Info
} from 'lucide-react';
import type { MediaItem } from '../../types.ts';
import { api } from '../../services/api.ts';

interface MediaTabProps {
  media: MediaItem[];
  token: string;
  onRefresh: () => void;
  onNotification: (msg: string, type: 'success' | 'error') => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  media,
  token,
  onRefresh,
  onNotification,
}) => {
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Replace modal state
  const [replacingItem, setReplacingItem] = useState<MediaItem | null>(null);
  const [replaceNewUrl, setReplaceNewUrl] = useState('');
  const [replaceNewTitle, setReplaceNewTitle] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  // Copied item ID
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle URL upload
  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;
    setIsUploading(true);
    try {
      await api.uploadMedia(
        {
          url: uploadUrl.trim(),
          title: uploadTitle.trim() || 'Web Image Asset',
          filename: 'web-asset.jpg',
        },
        token
      );
      setUploadUrl('');
      setUploadTitle('');
      onRefresh();
      onNotification('Image added to media library!', 'success');
    } catch (err: any) {
      onNotification(err.message || 'Failed to add image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotification('Please choose an image file (PNG, JPG, WEBP, SVG)', 'error');
      return;
    }

    const reader = new FileReader();
    setIsUploading(true);
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        await api.uploadMedia(
          {
            title: uploadTitle.trim() || file.name,
            filename: file.name,
            dataUrl,
          },
          token
        );
        setUploadTitle('');
        onRefresh();
        onNotification('Image uploaded successfully!', 'success');
      } catch (err: any) {
        onNotification(err.message || 'Upload failed', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      onNotification('Failed to read file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Handle Replace
  const handleExecuteReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingItem || !replaceNewUrl) return;

    setIsReplacing(true);
    try {
      const res = await api.replaceMedia(replacingItem.id, replaceNewUrl, replaceNewTitle || undefined, token);
      onNotification(
        `Image replaced successfully! Updated ${res.updatedCount} article/tool references across the site.`,
        'success'
      );
      setReplacingItem(null);
      setReplaceNewUrl('');
      setReplaceNewTitle('');
      onRefresh();
    } catch (err: any) {
      onNotification(err.message || 'Failed to replace image', 'error');
    } finally {
      setIsReplacing(false);
    }
  };

  const handleReplaceFileUpload = (file: File) => {
    const reader = new FileReader();
    setIsReplacing(true);
    reader.onload = async () => {
      try {
        // Upload replacement first as media
        const newMedia = await api.uploadMedia(
          {
            title: replaceNewTitle || file.name,
            filename: file.name,
            dataUrl: reader.result as string,
          },
          token
        );
        // Then execute replace on target item
        if (replacingItem) {
          const res = await api.replaceMedia(replacingItem.id, newMedia.url, newMedia.title, token);
          onNotification(
            `Image replaced successfully! Updated ${res.updatedCount} article/tool references.`,
            'success'
          );
        }
        setReplacingItem(null);
        setReplaceNewUrl('');
        onRefresh();
      } catch (err: any) {
        onNotification(err.message || 'Failed to upload replacement file', 'error');
      } finally {
        setIsReplacing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image from your media library?')) return;
    try {
      await api.deleteMedia(id, token);
      onRefresh();
      onNotification('Image removed from media library.', 'success');
    } catch (err: any) {
      onNotification(err.message || 'Failed to delete image', 'error');
    }
  };

  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <span>Media & Image Asset Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload new photography, replace existing images with automatic website-wide updates, and manage your asset library.
          </p>
        </div>
      </div>

      {/* Upload Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drag and drop upload card */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Upload Image File</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Drag and drop an image file here, or click the button below to browse from your device.
          </p>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Browse Local File'}
          </button>
        </div>

        {/* Upload via URL card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Import Image from Web URL</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add any web image (Unsplash, CDN, or external media link) directly to your library.
            </p>

            <form onSubmit={handleUrlUpload} className="mt-4 space-y-3">
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Asset title (e.g. AI Quantum Processor)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <input
                type="url"
                required
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isUploading || !uploadUrl}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isUploading ? 'Importing...' : 'Add Image URL to Library'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Media Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Image Assets ({media.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click "Replace" on any item to update everywhere it appears
          </span>
        </div>

        {media.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            No image assets uploaded yet. Upload an image above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.id, item.url)}
                      title="Copy URL"
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:text-blue-600 shadow-xs transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingItem(item);
                        setReplaceNewUrl(item.url);
                        setReplaceNewTitle(item.title);
                      }}
                      title="Replace this image across website"
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:text-indigo-600 shadow-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="Delete Image"
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[150px] font-mono">{item.filename}</span>
                    <span>{item.size ? `${Math.round(item.size / 1024)} KB` : ''}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingItem(item);
                        setReplaceNewUrl(item.url);
                        setReplaceNewTitle(item.title);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace Image</span>
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                    >
                      <span>View Full</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Replace Image Modal */}
      {replacingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Replace Image Asset</span>
              </div>
              <button
                type="button"
                onClick={() => setReplacingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Smart Cascade Replacement</span>
              </div>
              <p className="text-[11px] text-blue-800/90 leading-relaxed">
                When you replace this image, any article, AI tool, or header banner currently displaying it will automatically update to use the new image.
              </p>
            </div>

            {/* Current preview */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={replacingItem.url}
                alt="Current"
                className="w-16 h-12 object-cover rounded-lg border border-slate-200"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-slate-500">Currently Replacing:</span>
                <p className="text-xs font-bold text-slate-800 truncate">{replacingItem.title}</p>
              </div>
            </div>

            <form onSubmit={handleExecuteReplace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  New Image Title (Optional)
                </label>
                <input
                  type="text"
                  value={replaceNewTitle}
                  onChange={(e) => setReplaceNewTitle(e.target.value)}
                  placeholder="Updated image title"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  New Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={replaceNewUrl}
                  onChange={(e) => setReplaceNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Or upload file replacement */}
              <div className="text-center py-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">or upload replacement file</span>
              </div>

              <input
                type="file"
                ref={replaceFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleReplaceFileUpload(e.target.files[0]);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => replaceFileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Replacement File from Computer</span>
              </button>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReplacingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplacing || !replaceNewUrl}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isReplacing ? 'Updating...' : 'Save & Cascade Replace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
