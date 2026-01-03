# BrokerwellAI - Insurance Submission Platform

A modern platform for insurance brokers to streamline ACORD form submissions with AI-powered parsing and multi-carrier outreach.

## Features

- **AI-Powered ACORD Parsing**: Convert scanned PDFs to searchable, editable documents with OCR
- **Multi-Carrier Submission**: Send personalized emails to multiple carriers with one click
- **Side-by-Side Review**: Review PDF and email draft simultaneously
- **Smart Email Generation**: AI-tailored emails for each insurance company

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (to be integrated)
- **AI Services**: OpenAI API (to be integrated)
- **OCR Service**: ConvertAPI (to be integrated)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── HowItWorks.tsx
│   └── CTA.tsx
└── public/              # Static assets
```

## Next Steps

- [ ] Set up Supabase database
- [ ] Implement authentication
- [ ] Create PDF upload dashboard
- [ ] Integrate OpenAI API for email generation
- [ ] Integrate ConvertAPI for OCR
- [ ] Build email drafting interface
- [ ] Add multi-carrier submission functionality

## License

Proprietary - All rights reserved


