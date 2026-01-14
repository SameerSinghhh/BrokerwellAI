"use client";

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import UploadArea from "@/components/UploadArea";
import SideBySideInterface from "@/components/SideBySideInterface";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ExtractedPage {
  page: number;
  characters: number;
  content: string;
}

interface ExtractionResult {
  pages_total: number;
  characters_total: number;
  pages: ExtractedPage[];
  document_id?: string;
}

interface Document {
  id: string;
  file_name: string;
  page_count: number;
  character_count: number;
  created_at: string;
  extracted_text: ExtractionResult;
  storage_path: string;
  email_subject?: string;
  email_body?: string;
  email_generated_at?: string;
  extracted_data?: ExtractedData;
}

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

interface SubmissionResult {
  extractedData: ExtractedData;
  emailContent: EmailContent;
  pdfUrl: string;
  fileName: string;
  document_id: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("");

  useEffect(() => {
    // Check if account was just created
    if (searchParams.get("accountCreated") === "true") {
      setShowSuccess(true);
      // Clear the URL parameter
      router.replace("/");
      
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  }, [searchParams, router]);

  // Fetch user's documents
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase
        .from("documents")
        .select("id, file_name, storage_path, page_count, character_count, created_at, extracted_text, email_subject, email_body, email_generated_at, extracted_data")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
      } else {
        setDocuments(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setExtractedText(null);
    setError("");
    setSubmissionResult(null);
  };

  const handleGenerateSubmission = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    setIsProcessing(true);
    setError("");
    setExtractedText(null);
    setSubmissionResult(null);
    setProcessingStage("Extracting text from PDF...");

    try {
      // Get auth token
      const { supabase } = await import("@/lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated");
        setIsProcessing(false);
        return;
      }

      // Step 1: Extract text from PDF
      const formData = new FormData();
      formData.append("file", selectedFile);

      const processPdfResponse = await fetch("/api/process-pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const processPdfData = await processPdfResponse.json();

      if (!processPdfResponse.ok) {
        setError(processPdfData.error || "Failed to extract text");
        return;
      }

      // Combine all pages into one text for OpenAI
      const fullText = processPdfData.pages
        .map((p: ExtractedPage) => p.content)
        .join("\n\n");

      setProcessingStage("Generating email with AI...");

      // Step 2: Generate email with OpenAI
      const generateEmailResponse = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: fullText,
          fileName: selectedFile.name,
        }),
      });

      const generateEmailData = await generateEmailResponse.json();

      if (!generateEmailResponse.ok) {
        setError(generateEmailData.error || "Failed to generate email");
        return;
      }

      // Step 3: Create a blob URL from the file for PDF display
      const pdfUrl = URL.createObjectURL(selectedFile);

      // Step 4: Save the email to the database
      if (processPdfData.document_id) {
        console.log("Saving email to database...");
        console.log("Document ID:", processPdfData.document_id);
        console.log("Email subject:", generateEmailData.emailContent.subject);
        
        try {
          const saveEmailResponse = await fetch("/api/save-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              document_id: processPdfData.document_id,
              email_subject: generateEmailData.emailContent.subject,
              email_body: generateEmailData.emailContent.body,
              extracted_data: generateEmailData.extractedData,
            }),
          });

          const saveResult = await saveEmailResponse.json();
          
          if (!saveEmailResponse.ok) {
            console.error("Failed to save email to database:", saveResult);
          } else {
            console.log("Email saved successfully!");
          }
        } catch (saveError) {
          console.error("Error saving email:", saveError);
        }
      } else {
        console.warn("No document_id returned from PDF processing");
      }

      // Set the submission result to show side-by-side interface
      setSubmissionResult({
        extractedData: generateEmailData.extractedData,
        emailContent: generateEmailData.emailContent,
        pdfUrl: pdfUrl,
        fileName: selectedFile.name,
        document_id: processPdfData.document_id,
      });

      // Refresh documents list after a short delay to ensure save completes
      setTimeout(() => {
        fetchDocuments();
      }, 500);
      
      // Clear selected file
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  const handleBackToUpload = () => {
    setSubmissionResult(null);
    setExtractedText(null);
    setError("");
    setSelectedFile(null);
  };

  const viewDocument = async (doc: Document) => {
    try {
      const { supabase } = await import("@/lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated");
        return;
      }

      setIsProcessing(true);
      setProcessingStage("Loading document...");

      // Check if email already exists
      let emailContent: EmailContent;
      let extractedData: ExtractedData;

      if (doc.email_subject && doc.email_body && doc.extracted_data) {
        // Use stored email and extracted data - NO OpenAI call
        console.log("Using stored email and extracted data from database");
        emailContent = {
          subject: doc.email_subject,
          body: doc.email_body,
        };
        extractedData = doc.extracted_data;
      } else {
        // Generate new email with OpenAI (first time viewing)
        console.log("Generating email with OpenAI for first time");
        setProcessingStage("Generating email with AI...");

        const fullText = doc.extracted_text.pages
          .map((p: ExtractedPage) => p.content)
          .join("\n\n");

        const generateEmailResponse = await fetch("/api/generate-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extractedText: fullText,
            fileName: doc.file_name,
          }),
        });

        const generateEmailData = await generateEmailResponse.json();

        if (!generateEmailResponse.ok) {
          setError(generateEmailData.error || "Failed to generate email");
          setIsProcessing(false);
          return;
        }

        emailContent = generateEmailData.emailContent;
        extractedData = generateEmailData.extractedData;

        // Save the email and extracted data to database
        const saveEmailResponse = await fetch("/api/save-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            document_id: doc.id,
            email_subject: emailContent.subject,
            email_body: emailContent.body,
            extracted_data: extractedData,
          }),
        });

        if (!saveEmailResponse.ok) {
          console.error("Failed to save email to database");
        } else {
          // Refresh documents list to update the stored email
          fetchDocuments();
        }
      }

      // Get PDF URL from storage
      console.log("Fetching PDF from storage path:", doc.storage_path);
      const { data: urlData, error: urlError } = await supabase.storage
        .from("acord-pdfs")
        .createSignedUrl(doc.storage_path, 3600); // 1 hour expiry

      if (urlError) {
        console.error("Storage URL error:", urlError);
        setError(`Failed to get PDF URL: ${urlError.message}`);
        setIsProcessing(false);
        return;
      }

      if (!urlData?.signedUrl) {
        console.error("No signed URL in response:", urlData);
        setError("Failed to get PDF URL - no signed URL returned");
        setIsProcessing(false);
        return;
      }

      console.log("Got signed URL successfully");

      // Set the submission result to show side-by-side interface
      setSubmissionResult({
        extractedData: extractedData,
        emailContent: emailContent,
        pdfUrl: urlData.signedUrl,
        fileName: doc.file_name,
        document_id: doc.id,
      });

      setIsProcessing(false);
      setProcessingStage("");
    } catch (err: any) {
      console.error("View document error:", err);
      setError(err.message || "Failed to load document");
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  const deleteDocument = async (docId: string, storagePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const { supabase } = await import("@/lib/supabase");
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("acord-pdfs")
        .remove([storagePath]);

      if (storageError) {
        console.error("Storage error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", docId);

      if (dbError) {
        setError("Failed to delete document");
        return;
      }

      // Refresh list
      fetchDocuments();
      // Clear extracted text if it was the deleted document
      if (extractedText?.document_id === docId) {
        setExtractedText(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg shadow-2xl p-6 max-w-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-green-800">
                  Account Created Successfully! 🎉
                </h3>
                <p className="mt-2 text-sm text-green-700">
                  Welcome to BrokerwellAI! Please check your email to verify your account.
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-4 flex-shrink-0 text-green-500 hover:text-green-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Show dashboard if logged in, landing page if not */}
      {user ? (
        <>
          {/* Show side-by-side interface if we have a submission result */}
          {submissionResult ? (
            <SideBySideInterface
              pdfUrl={submissionResult.pdfUrl}
              extractedData={submissionResult.extractedData}
              emailContent={submissionResult.emailContent}
              fileName={submissionResult.fileName}
              onBack={handleBackToUpload}
              documentId={submissionResult.document_id}
            />
          ) : (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back! 👋
                  </h1>
                  <p className="text-gray-600">
                    {user.email}
                  </p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Generate Submission Email
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload your ACORD PDF file and we&apos;ll automatically generate a professional submission email for you.
                  </p>

                  {/* File Upload Area */}
                  <UploadArea 
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    isProcessing={isProcessing}
                  />

                  {/* Error Display */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Generate Button */}
                  {selectedFile && (
                    <button
                      onClick={handleGenerateSubmission}
                      disabled={isProcessing}
                      className="mt-6 w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? processingStage : "Generate Submission"}
                    </button>
                  )}
                </div>

                {/* Previous Uploads Section */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Previous Uploads ({documents.length}/20)
                  </h2>

                  {loadingDocs ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No documents uploaded yet. Upload your first ACORD form above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {doc.file_name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {doc.page_count} pages • {doc.character_count.toLocaleString()} characters • {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => viewDocument(doc)}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? "Loading..." : "View Submission"}
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id, doc.storage_path)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Hero />
          <Features />
          <HowItWorks />
          <CTA />
          
          <footer className="bg-gray-900 text-white py-8 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-400">
                © 2024 BrokerwellAI. All rights reserved.
              </p>
            </div>
          </footer>
        </>
      )}
    </main>
  );
}


