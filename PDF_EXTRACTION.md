# PDF Text Extraction Feature

## Overview
The PDF text extraction feature uses the aPDF.io API to extract text content from PDF files. This is the first step in processing ACORD forms for automated submission generation.

## How to Use

### 1. Sign In
- Go to http://localhost:3000
- Sign in with your account credentials
- You'll be redirected to the main application page

### 2. Extract Text from PDF

#### Method: URL Input (Currently Available)
1. Find a publicly accessible PDF URL (the aPDF.io API requires this)
2. Paste the URL into the "PDF File URL" field
3. **Optional**: Check "Use OCR" if the PDF is a scanned document
4. Click "Generate Submission"
5. The extracted text will appear below, organized by page

### Example PDF URLs for Testing
You can use these sample PDFs to test the extraction:
- https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
- Any other publicly accessible PDF URL

### OCR Option
- **Regular PDFs**: Leave OCR unchecked (faster, more accurate for digital PDFs)
- **Scanned Documents**: Check OCR to extract text from images

## Technical Details

### API Endpoints
- **Extract Text**: `/pdf/content/read` - For digital PDFs
- **OCR Extract**: `/pdf/ocr/read` - For scanned PDFs

### Environment Variables
The aPDF.io API key is stored securely in `.env.local`:
```
APDF_API_KEY=your_api_key_here
```

## Response Format
```json
{
  "pages_total": 3,
  "characters_total": 8642,
  "pages": [
    {
      "page": 1,
      "characters": 2398,
      "content": "Extracted text content..."
    }
  ]
}
```

## Next Steps
1. **File Upload**: Add direct file upload with temporary hosting
2. **Data Parsing**: Extract specific ACORD fields from the text
3. **Email Generation**: Use OpenAI to generate personalized carrier emails
4. **Multi-Carrier Submission**: Send to multiple carriers with one click

## Troubleshooting

### "File URL is required" Error
- Make sure you've entered a URL in the input field

### "Failed to extract text" Error
- Ensure the URL is publicly accessible
- Try enabling OCR if it's a scanned document
- Check that the file is actually a PDF

### Gray Buttons in Navigation
- This means your Supabase authentication isn't configured correctly
- Check your `.env.local` file for correct Supabase credentials
- The anon key should start with `eyJ...`



