# Email Generation Feature Guide

## Overview
This guide explains the new email generation feature that uses OpenAI to create professional submission emails from ACORD PDF documents.

## What's New

### 1. **OpenAI API Integration** (`/app/api/generate-email/route.ts`)
This new API endpoint handles two critical tasks:

#### Data Extraction
- Uses GPT-4o to extract structured data from the PDF text
- Extracts: Insured name, lines of coverage, policy limits, effective date, locations, and additional info
- Uses low temperature (0.1) for accurate extraction
- Returns data in a structured JSON format

#### Email Generation
- Uses the extracted data to generate a professional submission email
- Creates both subject line and email body
- Uses higher temperature (0.7) for more creative writing
- Returns plain text email content with proper formatting

### 2. **Side-by-Side Interface** (`/components/SideBySideInterface.tsx`)
A new component that displays:

**Left Panel:**
- PDF viewer (displays the original uploaded document)
- Extracted data summary (insured, coverage lines, limits, dates, locations)

**Right Panel:**
- Editable email subject line
- Editable email body (large textarea)
- Copy to clipboard button
- Send email button (placeholder for future implementation)

### 3. **Updated Main Page Flow** (`/app/page.tsx`)
The workflow now follows these steps:

1. **Upload**: User uploads an ACORD PDF file
2. **Process**: System extracts text using ConvertAPI
3. **Generate**: OpenAI analyzes the text and generates an email
4. **Review**: Side-by-side view shows PDF + editable email
5. **Edit & Send**: User can edit the email and copy/send it

## User Flow

### For New Uploads:
1. Click "Choose file" or drag-and-drop a PDF
2. Click "Generate Submission"
3. Wait for processing (shows progress: "Extracting text..." → "Generating email...")
4. View side-by-side interface with PDF and email
5. Edit email as needed
6. Copy or send the email

### For Previous Uploads:
1. Find the document in "Previous Uploads" section
2. Click "View & Generate Email"
3. System loads the stored PDF and generates a new email
4. View side-by-side interface with PDF and email
5. Edit email as needed
6. Copy or send the email

## API Endpoints

### `/api/process-pdf` (POST)
- Accepts: PDF file (FormData)
- Returns: Extracted text data and document ID
- Stores: PDF in Supabase Storage, metadata in database

### `/api/generate-email` (POST)
- Accepts: `{ extractedText: string, fileName: string }`
- Returns: `{ extractedData: {...}, emailContent: { subject, body } }`
- Uses: OpenAI GPT-4o for both extraction and generation

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ConvertAPI (PDF to text)
CONVERTAPI_SECRET=your_convertapi_secret

# OpenAI (Email generation)
OPENAI_API_KEY=your_openai_api_key
```

## Features

✅ **PDF Text Extraction** - Works with both digital and scanned documents (OCR)
✅ **AI-Powered Data Extraction** - Intelligently identifies key insurance information
✅ **Professional Email Generation** - Creates tailored submission emails
✅ **Side-by-Side Review** - View PDF and email simultaneously
✅ **Editable Email** - Modify subject and body before sending
✅ **Copy to Clipboard** - Quick copy functionality
✅ **Previous Documents** - Access and regenerate emails for past uploads
✅ **User-Specific Storage** - Each user can store up to 20 PDFs

## Technical Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, Database, Storage)
- **ConvertAPI** (PDF to text conversion with OCR)
- **OpenAI GPT-4o** (Data extraction and email generation)

## Future Enhancements

- [ ] Email sending functionality (SMTP integration)
- [ ] Email templates and customization
- [ ] Bulk email sending to multiple recipients
- [ ] Email tracking and analytics
- [ ] Advanced AI prompts for different insurance types
- [ ] Email history and drafts

## Testing

Server is running at: http://localhost:3001

Test the feature by:
1. Sign in with your account
2. Upload an ACORD PDF
3. Click "Generate Submission"
4. Review the generated email in the side-by-side view
5. Edit and copy the email as needed

## Notes

- The AI extraction is conservative - it only extracts information that's clearly visible in the document
- Email generation uses a higher temperature for more natural, varied writing
- PDFs are stored securely with Row Level Security (RLS) policies
- Each user has a limit of 20 stored documents

