import React, { useState } from 'react';
import { X, CheckCircle2, Mail, Shield, BookOpen, Send } from 'lucide-react';

interface InfoModalProps {
  type: 'about' | 'contact' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  if (!type) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            {type === 'about' && <BookOpen className="w-5 h-5 mr-2 text-blue-600" />}
            {type === 'contact' && <Mail className="w-5 h-5 mr-2 text-blue-600" />}
            {type === 'privacy' && <Shield className="w-5 h-5 mr-2 text-blue-600" />}
            {type === 'terms' && <BookOpen className="w-5 h-5 mr-2 text-blue-600" />}
            {type === 'about' && 'About AI Tech Hub'}
            {type === 'contact' && 'Editorial Contact & Inquiries'}
            {type === 'privacy' && 'Privacy Policy'}
            {type === 'terms' && 'Terms of Service'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
          {type === 'about' && (
            <div className="space-y-4">
              <p>
                <strong>AI Tech Hub</strong> is a lightweight, independent technology and artificial intelligence publication established to document the transition toward frontier machine intelligence.
              </p>
              <h3 className="text-base font-bold text-slate-900">Our Editorial Mission</h3>
              <p>
                In an era crowded with generic summaries and marketing hyperbole, AI Tech Hub provides deeply researched, mathematically sound, and practitioner-tested coverage. We test the models ourselves, run local benchmarks, and write hands-on engineering analyses.
              </p>
              <h3 className="text-base font-bold text-slate-900">Content Pillars</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><strong>AI News:</strong> Real-time dispatches from leading research labs and industry consortiums.</li>
                <li><strong>Tech News:</strong> Semiconductor fabrication, optical interconnects, and cloud architecture.</li>
                <li><strong>AI Tools Directory:</strong> An objective catalog of vetted software products with transparent pricing models.</li>
                <li><strong>Articles & Analysis:</strong> In-depth technical playbooks for software engineers and systems architects.</li>
              </ul>
            </div>
          )}

          {type === 'contact' && (
            <div>
              {contactSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">Message Dispatched</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out. Our editorial desk reviews correspondence daily and will reply promptly.
                  </p>
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      onClose();
                    }}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <p className="text-slate-600">
                    Submit research tips, article feedback, or software review submissions to our team.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Rostova"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@example.com"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Research tip on 2nm wafer fabrication"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your note or tip here..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send to Editorial Desk</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-3">
              <p>Last updated: September 2026</p>
              <h3 className="text-base font-bold text-slate-900">1. Information We Collect</h3>
              <p>
                AI Tech Hub operates on a privacy-first ethos. We do not engage in invasive device fingerprinting, cross-site telemetry trackers, or intrusive session recording.
              </p>
              <h3 className="text-base font-bold text-slate-900">2. Reader Correspondence</h3>
              <p>
                When you contact our editorial desk, your information is stored securely solely for responding to your inquiry. We never sell or license contact information to third parties.
              </p>
              <h3 className="text-base font-bold text-slate-900">3. Cookies & Local Storage</h3>
              <p>
                We use strictly essential cookies and local storage items necessary for reader preferences, security, and session maintenance.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-3">
              <p>Last updated: September 2026</p>
              <h3 className="text-base font-bold text-slate-900">1. Intellectual Property</h3>
              <p>
                All original research, editorial commentary, and custom benchmarks published on AI Tech Hub are protected under intellectual property law. Code samples provided in articles may be freely utilized under the MIT License.
              </p>
              <h3 className="text-base font-bold text-slate-900">2. Affiliate Disclosure</h3>
              <p>
                AI Tech Hub maintains editorial independence. Select software evaluations may contain affiliate links through which we may receive a commission. Such affiliations never compromise our rating objectivity.
              </p>
              <h3 className="text-base font-bold text-slate-900">3. Accuracy of Content</h3>
              <p>
                While our staff rigorously checks technical facts, readers should verify specific software APIs and pricing structures before enterprise procurement.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
