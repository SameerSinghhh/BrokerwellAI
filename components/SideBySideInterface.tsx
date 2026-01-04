'use client';

import { useState } from 'react';

interface ExtractedData {
  insured: string;
  lines: string[];
  limits: string;
  effectiveDate: string;
  locations: string[];
  additionalInfo?: string;
}

interface EmailContent {
  subject: string;
  body: string;
}

interface SideBySideInterfaceProps {
  pdfUrl: string;
  extractedData: ExtractedData;
  emailContent: EmailContent;
  fileName: string;
  onBack: () => void;
  documentId?: string;
}

export default function SideBySideInterface({
  pdfUrl,
  extractedData,
  emailContent,
  fileName,
  onBack,
  documentId,
}: SideBySideInterfaceProps) {
  const [subject, setSubject] = useState(emailContent.subject);
  const [body, setBody] = useState(emailContent.body);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!documentId) {
      alert('Cannot save: No document ID');
      return;
    }

    setSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert('Not authenticated');
        return;
      }

      const response = await fetch('/api/save-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          document_id: documentId,
          email_subject: subject,
          email_body: body,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save email');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Failed to save email: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - Keep it simple and below the Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-2"
          >
            ← Back to Upload
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Submission Review</h1>
          <p className="text-gray-600 text-sm">{fileName}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-[1800px] mx-auto">
        {/* Left Panel - PDF Viewer */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Original Document</h2>
          </div>
          
          <div className="flex-1 overflow-auto">
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>

          {/* Extracted Data Summary */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Extracted Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Insured:</span>
                <span className="ml-2 text-gray-600">{extractedData.insured}</span>
              </div>
              
              {extractedData.lines.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Lines of Coverage:</span>
                  <span className="ml-2 text-gray-600">{extractedData.lines.join(', ')}</span>
                </div>
              )}
              
              {extractedData.limits && extractedData.limits !== 'Not found' && (
                <div>
                  <span className="font-medium text-gray-700">Limits:</span>
                  <span className="ml-2 text-gray-600">{extractedData.limits}</span>
                </div>
              )}
              
              {extractedData.effectiveDate && extractedData.effectiveDate !== 'Not found' && (
                <div>
                  <span className="font-medium text-gray-700">Effective Date:</span>
                  <span className="ml-2 text-gray-600">{extractedData.effectiveDate}</span>
                </div>
              )}
              
              {extractedData.locations.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Locations:</span>
                  <div className="ml-2 text-gray-600">
                    {extractedData.locations.map((loc, idx) => (
                      <div key={idx}>• {loc}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Email Editor */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Generated Email</h2>
            <p className="text-xs text-gray-600 mt-1">Edit the email below as needed</p>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              {/* Subject Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Email Body */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
                  style={{ minHeight: '500px' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCopy}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {copied ? '✓ Copied to Clipboard' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !documentId}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => alert('Email sending functionality coming soon!')}
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

