'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  Hash,
  Home,
  Car,
  CreditCard,
  GraduationCap,
  Stethoscope,
  Zap,
  Phone,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { DebtTypeId } from '@/types';
import { cn } from '@/lib/utils';
import {
  Input,
  Label,
  Button,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { PersonalInfo } from './PersonalInfoForm';

export interface SpecificDebtSearch {
  debtType: DebtTypeId;
  accountNumber: string;
  companyName: string;
  originalAmount?: number;
  currentBalance?: number;
}

interface DebtSearchFormProps {
  personalInfo: PersonalInfo;
  onSearchAll: () => void;
  onSearchSpecific: (data: SpecificDebtSearch) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const debtTypes = [
  { id: 'mortgage' as DebtTypeId, name: 'Mortgage', icon: Home, color: 'from-amber-500 to-orange-500' },
  { id: 'auto' as DebtTypeId, name: 'Auto Loan', icon: Car, color: 'from-blue-500 to-cyan-500' },
  { id: 'creditCard' as DebtTypeId, name: 'Credit Card', icon: CreditCard, color: 'from-purple-500 to-pink-500' },
  { id: 'studentLoan' as DebtTypeId, name: 'Student Loan', icon: GraduationCap, color: 'from-green-500 to-emerald-500' },
  { id: 'medical' as DebtTypeId, name: 'Medical', icon: Stethoscope, color: 'from-red-500 to-rose-500' },
  { id: 'utility' as DebtTypeId, name: 'Utility', icon: Zap, color: 'from-yellow-500 to-amber-500' },
  { id: 'telecom' as DebtTypeId, name: 'Telecom', icon: Phone, color: 'from-cyan-500 to-teal-500' },
  { id: 'personalLoan' as DebtTypeId, name: 'Personal Loan', icon: Wallet, color: 'from-pink-500 to-rose-500' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export function DebtSearchForm({
  personalInfo,
  onSearchAll,
  onSearchSpecific,
  onBack,
  isLoading = false,
}: DebtSearchFormProps) {
  const [searchMode, setSearchMode] = useState<'all' | 'specific'>('all');
  const [selectedDebtType, setSelectedDebtType] = useState<DebtTypeId | null>(null);
  const [specificData, setSpecificData] = useState({
    accountNumber: '',
    companyName: '',
    originalAmount: '',
    currentBalance: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateSpecificField = (field: string, value: string) => {
    setSpecificData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateSpecific = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedDebtType) {
      newErrors.debtType = 'Please select a debt type';
    }
    if (!specificData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }
    if (!specificData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchAll = () => {
    onSearchAll();
  };

  const handleSearchSpecific = () => {
    if (validateSpecific() && selectedDebtType) {
      onSearchSpecific({
        debtType: selectedDebtType,
        accountNumber: specificData.accountNumber,
        companyName: specificData.companyName,
        originalAmount: specificData.originalAmount ? parseFloat(specificData.originalAmount) : undefined,
        currentBalance: specificData.currentBalance ? parseFloat(specificData.currentBalance) : undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* User Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {personalInfo.firstName[0]}{personalInfo.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium">{personalInfo.firstName} {personalInfo.lastName}</p>
            <p className="text-sm text-muted-foreground">
              {personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Edit Info
          </Button>
        </div>
      </Card>

      {/* Search Mode Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">How would you like to search?</h2>
        <p className="text-muted-foreground mb-6">
          You can search for all potential securitized debts or look up a specific account
        </p>

        <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'all' | 'specific')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Search All Debts
            </TabsTrigger>
            <TabsTrigger value="specific" className="gap-2">
              <Search className="h-4 w-4" />
              Specific Account
            </TabsTrigger>
          </TabsList>

          {/* Search All Tab */}
          <TabsContent value="all" className="space-y-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Search All Securitized Debts</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    We'll search SEC filings, FINRA TRACE data, and trust databases to find any
                    debts that may have been securitized in your name. This includes mortgages,
                    auto loans, credit cards, student loans, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {debtTypes.slice(0, 5).map((type) => (
                      <span
                        key={type.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-background border"
                      >
                        <type.icon className="h-3 w-3" />
                        {type.name}
                      </span>
                    ))}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-background border">
                      +3 more
                    </span>
                  </div>
                  <Button onClick={handleSearchAll} disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        Search All Debts
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Specific Account Tab */}
          <TabsContent value="specific" className="space-y-6">
            {/* Debt Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                What type of debt? <span className="text-destructive">*</span>
              </Label>
              {errors.debtType && (
                <p className="text-sm text-destructive">{errors.debtType}</p>
              )}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {debtTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    type="button"
                    variants={item}
                    onClick={() => {
                      setSelectedDebtType(type.id);
                      if (errors.debtType) setErrors((p) => ({ ...p, debtType: '' }));
                    }}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      selectedDebtType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2',
                      type.color
                    )}>
                      <type.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-medium text-sm">{type.name}</p>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  Account Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter your account or loan number"
                  value={specificData.accountNumber}
                  onChange={(e) => updateSpecificField('accountNumber', e.target.value)}
                  className={cn(errors.accountNumber && 'border-destructive')}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-destructive">{errors.accountNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Company/Servicer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Wells Fargo, Chase, Navient"
                  value={specificData.companyName}
                  onChange={(e) => updateSpecificField('companyName', e.target.value)}
                  className={cn(errors.companyName && 'border-destructive')}
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive">{errors.companyName}</p>
                )}
              </div>
            </div>

            {/* Optional Amount Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalAmount">
                  Original Amount <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="originalAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={specificData.originalAmount}
                    onChange={(e) => updateSpecificField('originalAmount', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentBalance">
                  Current Balance <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="currentBalance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={specificData.currentBalance}
                    onChange={(e) => updateSpecificField('currentBalance', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSearchSpecific}
                disabled={isLoading}
                size="lg"
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    Search This Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
