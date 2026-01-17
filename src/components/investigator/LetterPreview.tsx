'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Download,
  Printer,
  Mail,
  Check,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { DebtTypeId, Trust, DebtInfo } from '@/types';
import { DEBT_TYPES } from '@/lib';
import { cn } from '@/lib/utils';
import { Card, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';

interface LetterPreviewProps {
  letter: string;
  debtType: DebtTypeId;
  trust: Trust | null;
  debtInfo: DebtInfo;
  onExportPDF?: () => void;
  onPrint?: () => void;
}

export function LetterPreview({
  letter,
  debtType,
  trust,
  debtInfo,
  onExportPDF,
  onPrint,
}: LetterPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const debtTypeConfig = DEBT_TYPES[debtType];
  const letterType = debtType === 'mortgage' ? 'QWR' : 'DVL';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const LetterContent = ({ className }: { className?: string }) => (
    <div
      ref={contentRef}
      className={cn(
        'bg-white text-black p-8 md:p-12 font-serif leading-relaxed shadow-lg',
        className
      )}
      style={{ fontSize: `${zoom}%` }}
    >
      <pre className="whitespace-pre-wrap font-serif text-sm md:text-base">
        {letter}
      </pre>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `rgb(var(--${debtType}) / 0.1)` }}
          >
            <FileText
              className="h-5 w-5"
              style={{ color: `rgb(var(--${debtType}))` }}
            />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {letterType === 'QWR' ? 'Qualified Written Request' : 'Debt Validation Letter'}
              <Badge variant="success">{letterType}</Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Generated for {debtInfo.borrowerName || 'your account'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 150}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trust Info */}
      {trust && (
        <Card className="p-4 bg-muted/50">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Trust:</span>{' '}
              <span className="font-medium">{trust.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Trustee:</span>{' '}
              <span className="font-medium">{trust.trustee}</span>
            </div>
            <div>
              <span className="text-muted-foreground">CUSIPs:</span>{' '}
              <span className="font-mono text-xs">{trust.cusips[0]?.cusip}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Letter Preview */}
      <Card className="overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <LetterContent />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCopy} variant="outline">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </>
          )}
        </Button>

        {onExportPDF && (
          <Button onClick={onExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        )}

        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>

        <Button variant={debtType}>
          <Mail className="mr-2 h-4 w-4" />
          Send via Certified Mail
        </Button>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-amber-500/10 border-amber-500/20">
        <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">
          Important Instructions
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Send this letter via USPS Certified Mail with Return Receipt Requested</li>
          <li>• Keep a copy of the letter and the certified mail receipt for your records</li>
          <li>• The servicer has 30 days (RESPA) or 30-45 days (FDCPA) to respond</li>
          <li>• Do not include payment with this letter</li>
          <li>• Consider consulting with a consumer rights attorney</li>
        </ul>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {letterType === 'QWR' ? 'Qualified Written Request' : 'Debt Validation Letter'}
            </DialogTitle>
          </DialogHeader>
          <LetterContent />
        </DialogContent>
      </Dialog>
    </div>
  );
}
