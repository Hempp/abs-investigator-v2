'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  MoreVertical,
  FileText,
  Building2,
  BarChart3,
  Clock,
  Tag,
  Bell,
  MessageSquare,
  Plus,
  Check,
} from 'lucide-react';
import { Case, CaseStatus } from '@/types';
import { DEBT_TYPES } from '@/lib';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils';
import { useCaseStore, useToast } from '@/stores';
import { cn } from '@/lib/utils';
import {
  Card,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
  Input,
} from '@/components/ui';
import { CaseTimeline } from './CaseTimeline';

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
}

const statusOptions: { value: CaseStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'letter_generated', label: 'Letter Generated', color: 'bg-blue-500' },
  { value: 'letter_sent', label: 'Letter Sent', color: 'bg-orange-500' },
  { value: 'response_received', label: 'Response Received', color: 'bg-green-500' },
  { value: 'escalated', label: 'Escalated', color: 'bg-red-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-emerald-500' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-400' },
];

export function CaseDetail({ caseData, onBack }: CaseDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState(caseData.notes);
  const [newTag, setNewTag] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const { updateStatus, updateNotes, addTag, removeTag } = useCaseStore();
  const { success } = useToast();

  const debtTypeConfig = DEBT_TYPES[caseData.debtType];

  const handleStatusChange = (newStatus: CaseStatus) => {
    updateStatus(caseData.id, newStatus);
    success('Status Updated', `Case status changed to ${newStatus.replace(/_/g, ' ')}`);
  };

  const handleSaveNotes = () => {
    updateNotes(caseData.id, notes);
    setIsEditingNotes(false);
    success('Notes Saved');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !caseData.tags.includes(newTag.trim())) {
      addTag(caseData.id, newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Back + Title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `rgb(var(--${caseData.debtType}) / 0.1)` }}
              >
                <debtTypeConfig.icon
                  className="h-6 w-6"
                  style={{ color: `rgb(var(--${caseData.debtType}))` }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {caseData.debtInfo.borrowerName || 'Unnamed Case'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Case #{caseData.id.slice(0, 8)} • Created {formatDate(caseData.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Status Selector */}
        <div className="mt-4 pt-4 border-t">
          <label className="text-sm text-muted-foreground mb-2 block">Case Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status.value}
                variant={caseData.status === status.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status.value)}
                className={cn(
                  caseData.status === status.value && status.color,
                  caseData.status === status.value && 'text-white'
                )}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Debt Info */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <debtTypeConfig.icon className="h-4 w-4" />
                Debt Information
              </h3>
              <div className="space-y-3 text-sm">
                {caseData.debtInfo.borrowerName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Borrower</span>
                    <span className="font-medium">{caseData.debtInfo.borrowerName}</span>
                  </div>
                )}
                {caseData.debtInfo.accountNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account #</span>
                    <span className="font-mono">{caseData.debtInfo.accountNumber}</span>
                  </div>
                )}
                {caseData.debtInfo.originalAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Amount</span>
                    <span className="font-medium">{formatCurrency(caseData.debtInfo.originalAmount)}</span>
                  </div>
                )}
                {caseData.debtInfo.currentBalance && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-medium">{formatCurrency(caseData.debtInfo.currentBalance)}</span>
                  </div>
                )}
                {caseData.debtInfo.currentServicer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicer</span>
                    <span className="font-medium">{caseData.debtInfo.currentServicer}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Trust Info */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4" />
                Securitization Trust
              </h3>
              {caseData.trust ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trust Name</span>
                    <span className="font-medium text-right">{caseData.trust.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trustee</span>
                    <span className="font-medium">{caseData.trust.trustee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Match Score</span>
                    <span className="font-medium">{formatPercentage(caseData.trust.matchScore * 100)}</span>
                  </div>
                  {caseData.trust.dealSize && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deal Size</span>
                      <span className="font-medium">{formatCurrency(caseData.trust.dealSize)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No trust associated with this case</p>
              )}
            </Card>

            {/* Trading Data Summary */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4" />
                Trading Data
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trade Count</span>
                  <span className="font-medium">{caseData.tradingDataCount}</span>
                </div>
                {caseData.tradingDataSample.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Recent Trades:</span>
                    <div className="mt-2 space-y-1">
                      {caseData.tradingDataSample.slice(0, 3).map((trade) => (
                        <div key={trade.id} className="flex justify-between text-xs">
                          <span className="font-mono">{trade.cusip}</span>
                          <span>{formatCurrency(parseFloat(trade.price))}</span>
                          <Badge variant={trade.side === 'BUY' ? 'success' : 'destructive'} className="text-xs">
                            {trade.side}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {caseData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(caseData.id, tag)}
                  >
                    {tag}
                    <span className="ml-1 opacity-50">×</span>
                  </Badge>
                ))}
                {caseData.tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="h-8"
                />
                <Button size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Generated Letter Preview */}
          {caseData.generatedLetter && (
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4" />
                Generated Letter
              </h3>
              <div className="bg-white text-black p-4 rounded border max-h-60 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap font-serif">
                  {caseData.generatedLetter.substring(0, 500)}...
                </pre>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                <Download className="mr-2 h-4 w-4" />
                Download Full Letter
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          <Card className="p-6">
            {caseData.documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No Documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload documents related to this case
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {caseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <Card className="p-6">
            <CaseTimeline events={caseData.timeline} />
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Case Notes
              </h3>
              {isEditingNotes ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingNotes(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNotes}>
                    <Check className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(true)}>
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
            {isEditingNotes ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this case..."
                rows={10}
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {caseData.notes || (
                  <p className="text-muted-foreground italic">No notes yet</p>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
