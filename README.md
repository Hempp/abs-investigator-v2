# ABS Investigator v2

A powerful multi-source investigation tool for Asset-Backed Securities (ABS) and Mortgage-Backed Securities (MBS). Helps consumers and professionals identify securitized debt trusts, verify ownership chains, and analyze servicer complaint histories.

**Live Demo:** [abs-investigator-v2.vercel.app](https://abs-investigator-v2.vercel.app)

## Features

- **Multi-Source Investigation** - Cross-references multiple authoritative data sources for accurate results
- **Real SEC EDGAR Data** - Searches actual SEC filings for ABS/MBS trusts
- **CFPB Complaint Analysis** - Real consumer complaint data with risk scoring
- **FINRA TRACE Integration** - Bond trading data verification
- **Economic Context** - Current market conditions from FRED/Freddie Mac
- **QWR Letter Generation** - Generates Qualified Written Request letters

## Data Sources

| Source | Data Type | API Key Required |
|--------|-----------|------------------|
| **SEC EDGAR** | Trust filings, CUSIPs, prospectuses | No |
| **FINRA TRACE** | Bond trading history, pricing | No |
| **OpenFIGI** | Security identification, CUSIP lookups | No |
| **CFPB** | Consumer complaints against servicers | No |
| **FRED** | Economic indicators, interest rates | Optional |
| **Freddie Mac PMMS** | Mortgage rates (fallback) | No |

## Supported Debt Types

- **Mortgage** - RMBS, MBS trusts
- **Auto Loans** - Auto ABS trusts
- **Credit Cards** - Credit card receivables
- **Student Loans** - SLABS trusts
- **Personal Loans** - Consumer loan ABS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Hempp/abs-investigator-v2.git
cd abs-investigator-v2

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables (Optional)

Create a `.env.local` file for optional API keys:

```env
# Optional: FRED API key for live economic data
# Get free key at: https://fred.stlouisfed.org/docs/api/api_key.html
FRED_API_KEY=your_fred_api_key
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/investigate/enhanced` | POST | Multi-source investigation |
| `/api/sec/filings` | GET | Search SEC EDGAR filings |
| `/api/cfpb` | GET | Search CFPB complaints |
| `/api/trading/[cusip]` | GET | Get FINRA TRACE data |
| `/api/cusip/[cusip]` | GET | OpenFIGI CUSIP lookup |
| `/api/economic` | GET | Economic context data |

## Example API Usage

```bash
# Enhanced investigation
curl -X POST "https://abs-investigator-v2.vercel.app/api/investigate/enhanced" \
  -H "Content-Type: application/json" \
  -d '{"debtType":"mortgage","servicerName":"Wells Fargo","state":"CA"}'

# CFPB complaints
curl "https://abs-investigator-v2.vercel.app/api/cfpb?company=Wells%20Fargo"

# Economic data
curl "https://abs-investigator-v2.vercel.app/api/economic"
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── investigator/      # Investigation UI components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── services/          # External API integrations
│   │   ├── secEdgar.ts    # SEC EDGAR API
│   │   ├── finraTrace.ts  # FINRA TRACE API
│   │   ├── cfpbComplaints.ts # CFPB API
│   │   ├── openFigi.ts    # OpenFIGI API
│   │   └── fredEconomic.ts # FRED/Freddie Mac API
│   └── utils/             # Utility functions
├── stores/                # Zustand state management
└── types/                 # TypeScript types
```

## How It Works

1. **User Input** - Enter debt details (servicer, type, state, amount)
2. **Multi-Source Search** - Queries SEC EDGAR, OpenFIGI, CFPB in parallel
3. **Trust Matching** - Identifies potential ABS/MBS trusts
4. **Verification** - Cross-references with FINRA TRACE for trading data
5. **Risk Analysis** - Analyzes CFPB complaints for servicer risk scoring
6. **Results** - Displays matched trusts with SEC links and complaint data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This tool is for informational and educational purposes only. It does not constitute legal or financial advice. Always consult with qualified professionals for specific debt-related matters.

---

Built with Next.js and real government data APIs.
