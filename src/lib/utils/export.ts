import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Case, Trust, Trade, DebtInfo, DebtTypeId } from '@/types';
import { formatCurrency, formatDate } from './format';

/**
 * Export letter to PDF
 */
export const exportLetterToPDF = async (
  letterContent: string,
  filename: string = 'qwr-letter'
): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  // Set font
  pdf.setFont('helvetica');
  pdf.setFontSize(11);

  // Split content into lines that fit the page width
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 25;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 5;
  let yPosition = margin;
  const pageHeight = pdf.internal.pageSize.getHeight();

  const lines = letterContent.split('\n');

  for (const line of lines) {
    // Handle page breaks
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    if (line.trim() === '') {
      yPosition += lineHeight;
      continue;
    }

    // Word wrap long lines
    const splitLines = pdf.splitTextToSize(line, maxWidth);
    for (const splitLine of splitLines) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(splitLine, margin, yPosition);
      yPosition += lineHeight;
    }
  }

  // Save the PDF
  pdf.save(`${filename}.pdf`);
};

/**
 * Export element to PDF using html2canvas
 */
export const exportElementToPDF = async (
  element: HTMLElement,
  filename: string = 'export'
): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
};

/**
 * Export trading data to CSV
 */
export const exportTradesToCSV = (
  trades: Trade[],
  filename: string = 'trading-data'
): void => {
  const headers = [
    'Date',
    'Time',
    'CUSIP',
    'Price',
    'Yield',
    'Volume',
    'Side',
    'Dealer',
    'Report Type',
  ];

  const rows = trades.map((trade) => [
    trade.date,
    trade.time,
    trade.cusip || '',
    trade.price,
    trade.yield,
    trade.volume.toString(),
    trade.side,
    trade.dealer,
    trade.reportType,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

/**
 * Export case data to JSON
 */
export const exportCaseToJSON = (caseData: Case): void => {
  const jsonContent = JSON.stringify(caseData, null, 2);
  downloadFile(jsonContent, `case-${caseData.id}.json`, 'application/json');
};

/**
 * Export investigation summary to text
 */
export const exportInvestigationSummary = (
  debtType: DebtTypeId,
  debtInfo: DebtInfo,
  trust: Trust | null,
  trades: Trade[]
): void => {
  const lines: string[] = [
    '='.repeat(60),
    'ABS INVESTIGATOR - INVESTIGATION SUMMARY',
    '='.repeat(60),
    '',
    `Generated: ${formatDate(new Date().toISOString())}`,
    '',
    '-'.repeat(40),
    'DEBT INFORMATION',
    '-'.repeat(40),
    `Type: ${debtType}`,
    `Borrower: ${debtInfo.borrowerName || 'N/A'}`,
    `Account: ${debtInfo.accountNumber || debtInfo.loanNumber || 'N/A'}`,
    `Servicer: ${debtInfo.servicerName || debtInfo.servicer || 'N/A'}`,
    '',
  ];

  if (trust) {
    lines.push(
      '-'.repeat(40),
      'IDENTIFIED TRUST',
      '-'.repeat(40),
      `Trust Name: ${trust.name}`,
      `Trust ID: ${trust.trustId}`,
      `Trustee: ${trust.trustee}`,
      `Closing Date: ${formatDate(trust.closingDate)}`,
      `Original Balance: ${formatCurrency(trust.originalBalance)}`,
      `Match Score: ${trust.matchScore}%`,
      '',
      'Match Reasons:',
      ...trust.matchReasons.map((r) => `  - ${r}`),
      '',
      'CUSIPs:',
      ...trust.cusips.map(
        (c) => `  ${c.cusip} | ${c.tranche} | ${c.rating} | ${formatCurrency(c.balance)}`
      ),
      ''
    );
  }

  if (trades.length > 0) {
    lines.push(
      '-'.repeat(40),
      'TRADING DATA SUMMARY',
      '-'.repeat(40),
      `Total Trades: ${trades.length}`,
      `Latest Trade: ${trades[0]?.date || 'N/A'}`,
      ''
    );
  }

  const content = lines.join('\n');
  downloadFile(content, 'investigation-summary.txt', 'text/plain');
};

/**
 * Print letter content
 */
export const printLetter = (letterContent: string): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QWR Letter</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            max-width: 8.5in;
            margin: 1in auto;
            padding: 0 0.5in;
          }
          pre {
            font-family: inherit;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          @media print {
            body { margin: 0; padding: 0.5in; }
          }
        </style>
      </head>
      <body>
        <pre>${letterContent}</pre>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      textArea.remove();
    }
  }
};

/**
 * Helper to download a file
 */
const downloadFile = (
  content: string,
  filename: string,
  mimeType: string
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export to PDF alias
 */
export const exportToPDF = exportLetterToPDF;

/**
 * Export to CSV alias
 */
export const exportToCSV = exportTradesToCSV;
