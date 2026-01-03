import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { extractedText, fileName, notes } = await request.json();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No extracted text provided' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Extract structured data using OpenAI
    console.log('Extracting structured data with OpenAI...');
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a precise document data extractor. Your ONLY job is to extract information that is ACTUALLY VISIBLE in the document. DO NOT make assumptions, guesses, or create information. If information is not visible in the document, return "Not found" or empty values. Be extremely conservative - only extract what you can clearly see.',
          },
          {
            role: 'user',
            content: `You are an expert at processing insurance ACORD forms.

CRITICAL INSTRUCTIONS:
- ONLY extract information that is ACTUALLY VISIBLE in the document
- DO NOT make assumptions, guesses, or fill in missing information
- If a field is not found in the document, use "Not found" or an empty value
- Be extremely precise and only use exact text from the document
- Do not infer or create information that isn't explicitly stated

${notes ? `ADDITIONAL NOTES FROM USER: ${notes}\n\n` : ''}

Extract ONLY the following information that you can actually see in the document:
- Insured name/company (exact text from the form)
- Lines of coverage (only if explicitly listed: General Liability, Property, Workers' Compensation, etc.)
- Policy limits (exact numbers and text as shown)
- Effective date (exact date format as shown)
- Locations (only addresses/locations explicitly listed)
- DESCRIPTION OF OPERATIONS / LOCATIONS / VEHICLES section (ACORD 101, Additional Remarks Schedule) - Extract the EXACT text from this section if present

--- DOCUMENT TEXT (extracted from PDF: ${fileName}) ---

${extractedText}

--- END OF DOCUMENT TEXT ---

Now extract the information from the text above.

Return the extracted information in JSON format. Use "Not found" for any field that is not present in the document:
{
  "insured": "exact company name from document or 'Not found'",
  "lines": ["only coverage types explicitly listed or empty array []"],
  "limits": "exact limits as shown or 'Not found'",
  "effectiveDate": "exact date as shown or 'Not found'",
  "locations": ["only locations explicitly listed or empty array []"],
  "additionalInfo": "EXACT text from DESCRIPTION OF OPERATIONS / LOCATIONS / VEHICLES section if present, otherwise 'Not found'. Copy the text verbatim, do not summarize or rephrase."
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      console.error('OpenAI extraction error:', errorText);
      return NextResponse.json(
        { error: 'Failed to extract data with OpenAI' },
        { status: 500 }
      );
    }

    const extractionData = await extractionResponse.json();
    const extractedData: ExtractedData = JSON.parse(extractionData.choices[0].message.content);

    console.log('Extracted data:', extractedData);

    // Step 2: Generate email using OpenAI
    console.log('Generating email with OpenAI...');
    const emailResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional insurance broker. Write compelling submission emails that highlight key information and make a strong case for the submission.',
          },
          {
            role: 'user',
            content: `Generate a professional insurance submission email based on the following extracted data:

${JSON.stringify(extractedData, null, 2)}

Create a professional email with:
- A clear, compelling subject line
- Professional greeting
- Summary of the submission with key highlights
- Organized presentation of coverage details, limits, and locations
- Professional closing

Return JSON with "subject" and "body" fields. The body should be formatted as plain text (not HTML) with proper line breaks (use \\n for line breaks).`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('OpenAI email generation error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate email with OpenAI' },
        { status: 500 }
      );
    }

    const emailData = await emailResponse.json();
    const emailContent: EmailContent = JSON.parse(emailData.choices[0].message.content);

    console.log('Generated email:', emailContent);

    return NextResponse.json({
      success: true,
      extractedData,
      emailContent,
    });

  } catch (error: any) {
    console.error('Error in generate-email API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}

