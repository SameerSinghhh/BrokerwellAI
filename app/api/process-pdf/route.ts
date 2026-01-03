import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const CONVERTAPI_SECRET = process.env.CONVERTAPI_SECRET;

export async function POST(request: NextRequest) {
  let uploadedFilePath: string | null = null;

  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Initialize Supabase client with auth
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!CONVERTAPI_SECRET) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Check document limit
    const { count, error: countError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Count error:", countError);
    }

    if (count !== null && count >= 20) {
      return NextResponse.json(
        { error: "Maximum of 20 documents reached. Please delete some documents first." },
        { status: 400 }
      );
    }

    console.log("Converting PDF to text with ConvertAPI...");

    // Convert file to text using ConvertAPI
    const convertFormData = new FormData();
    convertFormData.append("File", file);

    let convertResponse;
    try {
      convertResponse = await fetch(
        `https://v2.convertapi.com/convert/pdf/to/txt?Secret=${CONVERTAPI_SECRET}`,
        {
          method: "POST",
          body: convertFormData,
        }
      );
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: `Network error: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!convertResponse.ok) {
      const errorText = await convertResponse.text();
      console.error("ConvertAPI error:", errorText);
      return NextResponse.json(
        { error: `Failed to convert PDF: ${errorText}` },
        { status: convertResponse.status }
      );
    }

    let convertData;
    try {
      convertData = await convertResponse.json();
      console.log("PDF converted successfully!");
      console.log("ConvertAPI response:", JSON.stringify(convertData, null, 2));
    } catch (jsonError: any) {
      console.error("JSON parse error:", jsonError);
      return NextResponse.json(
        { error: "Failed to parse ConvertAPI response" },
        { status: 500 }
      );
    }

    // Download the converted text file
    if (!convertData.Files || convertData.Files.length === 0) {
      console.error("No files in response:", convertData);
      return NextResponse.json(
        { error: "No text extracted from PDF" },
        { status: 500 }
      );
    }

    // ConvertAPI returns the text as base64 encoded data, not a URL
    const fileData = convertData.Files[0].FileData;
    if (!fileData) {
      console.error("No FileData in response");
      return NextResponse.json(
        { error: "No text data in response" },
        { status: 500 }
      );
    }

    // Decode base64 to get the text
    console.log("Decoding base64 text data...");
    const extractedText = Buffer.from(fileData, "base64").toString("utf-8");

    // Count characters and pages (approximate)
    const characterCount = extractedText.length;
    const pageCount = Math.max(1, Math.ceil(characterCount / 3000)); // Rough estimate

    // Format extracted text into pages structure for consistency
    const formattedData = {
      pages_total: pageCount,
      characters_total: characterCount,
      pages: [{
        page: 1,
        characters: characterCount,
        content: extractedText,
      }],
    };

    // Now upload to Supabase Storage for permanent storage
    console.log("Storing PDF in Supabase Storage...");
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${user.id}/${timestamp}-${randomString}-${sanitizedFileName}`;
    uploadedFilePath = fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("acord-pdfs")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage error:", uploadError);
      // Continue anyway - we have the text extracted
    }

    // Save document metadata to database
    console.log("Saving document metadata to database...");
    const { data: docData, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        file_name: file.name,
        storage_path: fileName,
        file_size: file.size,
        page_count: pageCount,
        character_count: characterCount,
        extracted_text: formattedData,
      })
      .select()
      .single();

    if (docError) {
      console.error("Database error:", docError);
      // Continue anyway but warn that document wasn't saved
      console.warn("Document metadata was not saved to database");
    } else {
      console.log("Document saved with ID:", docData?.id);
    }

    console.log("Process complete!");

    return NextResponse.json({
      ...formattedData,
      document_id: docData?.id,
    });
  } catch (error: any) {
    console.error("PDF processing error:", error);

    // Cleanup on error
    if (uploadedFilePath) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await supabase.storage.from("acord-pdfs").remove([uploadedFilePath]);
        console.log("Cleaned up file after error");
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: error.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};
