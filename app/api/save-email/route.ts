import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { document_id, email_subject, email_body } = await request.json();

    if (!document_id || !email_subject || !email_body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Attempting to save email for document:', document_id);
    console.log('User ID:', user.id);

    // First check if document exists
    const { data: existingDoc, error: checkError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', document_id)
      .single();

    if (checkError || !existingDoc) {
      console.error('Document not found:', checkError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (existingDoc.user_id !== user.id) {
      console.error('User does not own this document');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the document with the email
    const { data, error } = await supabase
      .from('documents')
      .update({
        email_subject,
        email_body,
        email_generated_at: new Date().toISOString(),
      })
      .eq('id', document_id)
      .select()
      .single();

    if (error) {
      console.error('Database error during update:', error);
      return NextResponse.json(
        { error: 'Failed to save email' },
        { status: 500 }
      );
    }

    console.log('Email saved successfully!');
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error('Error in save-email API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save email' },
      { status: 500 }
    );
  }
}

