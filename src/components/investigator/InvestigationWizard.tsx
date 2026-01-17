'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { DebtTypeId, DebtInfo, Trust } from '@/types';
import { useInvestigationStore, useCaseStore, useToast } from '@/stores';
import { exportToPDF, exportToCSV } from '@/lib/utils';
import { Button, Card } from '@/components/ui';
import { ProgressStepper } from './ProgressStepper';
import { PersonalInfoForm, PersonalInfo } from './PersonalInfoForm';
import { DebtSearchForm, SpecificDebtSearch } from './DebtSearchForm';
import { TrustResults } from './TrustResults';
import { TradingDataTable } from './TradingDataTable';
import { TradingChart } from './TradingChart';
import { LetterPreview } from './LetterPreview';
import { EvidenceSummary } from './EvidenceSummary';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function InvestigationWizard() {
  const {
    personalInfo,
    activeDebtType,
    step,
    debtInfo,
    isLoading,
    foundTrusts,
    selectedTrust,
    tradingData,
    tradingStats,
    generatedLetter,
    setPersonalInfo,
    setStep,
    searchAllDebts,
    searchSpecificDebt,
    selectTrust,
    generateQWRLetter,
    resetInvestigation,
  } = useInvestigationStore();

  const { createCase } = useCaseStore();
  const { success, error } = useToast();

  // Handle personal info submission
  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setPersonalInfo(data);
  };

  // Handle search all debts
  const handleSearchAll = async () => {
    await searchAllDebts();
  };

  // Handle specific debt search
  const handleSearchSpecific = async (data: SpecificDebtSearch) => {
    await searchSpecificDebt(data);
  };

  // Handle trust selection
  const handleTrustSelect = (trust: Trust) => {
    selectTrust(trust);
  };

  // Generate letter
  const handleGenerateLetter = () => {
    generateQWRLetter();
  };

  // Save as case
  const handleSaveCase = () => {
    if (!activeDebtType) return;

    try {
      const caseId = createCase({
        debtType: activeDebtType,
        debtInfo,
        trust: selectedTrust,
        tradingData,
        letter: generatedLetter,
      });

      success('Case Created', `Your investigation has been saved as case #${caseId.slice(0, 8)}`);
    } catch (err) {
      error('Error', 'Failed to save case. Please try again.');
    }
  };

  // Export functions
  const handleExportPDF = async () => {
    if (!generatedLetter) return;

    try {
      await exportToPDF(
        generatedLetter,
        `qwr-letter-${new Date().toISOString().slice(0, 10)}.pdf`
      );
      success('Exported', 'Letter exported as PDF');
    } catch (err) {
      error('Export Failed', 'Could not export PDF');
    }
  };

  const handleExportCSV = () => {
    if (tradingData.length === 0) return;

    try {
      exportToCSV(
        tradingData,
        `trading-data-${new Date().toISOString().slice(0, 10)}.csv`
      );
      success('Exported', 'Trading data exported as CSV');
    } catch (err) {
      error('Export Failed', 'Could not export CSV');
    }
  };

  // Navigation helpers
  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as any);
    }
  };

  const handleReset = () => {
    resetInvestigation();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Progress */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">ABS Investigator</h1>
            <p className="text-muted-foreground">
              Discover if your debt has been securitized
            </p>
          </div>

          {step > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Start Over
              </Button>
            </div>
          )}
        </div>

        <ProgressStepper currentStep={step} onStepClick={setStep} />
      </Card>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {/* Step 0: Personal Information */}
        {step === 0 && (
          <motion.div
            key="step-0"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <PersonalInfoForm
              initialData={personalInfo || undefined}
              onSubmit={handlePersonalInfoSubmit}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Step 1: Debt Search Options */}
        {step === 1 && personalInfo && (
          <motion.div
            key="step-1"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <DebtSearchForm
              personalInfo={personalInfo}
              onSearchAll={handleSearchAll}
              onSearchSpecific={handleSearchSpecific}
              onBack={() => setStep(0)}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Step 2: Trust Results */}
        {step === 2 && (
          <motion.div
            key="step-2"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <TrustResults
              trusts={foundTrusts}
              debtType={activeDebtType || 'mortgage'}
              selectedTrust={selectedTrust}
              onSelectTrust={handleTrustSelect}
              onBack={() => setStep(1)}
            />
          </motion.div>
        )}

        {/* Step 3: Trading Data & Letter Generation */}
        {step === 3 && (
          <motion.div
            key="step-3"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Trading Data Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Trading History</h3>
                <TradingChart trades={tradingData} stats={tradingStats} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">FINRA TRACE Data</h3>
                <TradingDataTable
                  trades={tradingData}
                  stats={tradingStats}
                  onExportCSV={handleExportCSV}
                />
              </div>
            </div>

            {/* Letter Generation */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Generate Letter</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a {activeDebtType === 'mortgage' ? 'Qualified Written Request' : 'Debt Validation Letter'}
                  </p>
                </div>
                {!generatedLetter && (
                  <Button onClick={handleGenerateLetter} variant={activeDebtType || 'default'}>
                    Generate Letter
                  </Button>
                )}
              </div>

              {generatedLetter && (
                <LetterPreview
                  letter={generatedLetter}
                  debtType={activeDebtType || 'mortgage'}
                  trust={selectedTrust}
                  debtInfo={debtInfo}
                  onExportPDF={handleExportPDF}
                />
              )}
            </Card>

            {/* Evidence Summary */}
            <EvidenceSummary
              debtType={activeDebtType || 'mortgage'}
              debtInfo={debtInfo}
              trust={selectedTrust}
              tradingData={tradingData}
              tradingStats={tradingStats}
              letter={generatedLetter}
              onSaveCase={handleSaveCase}
              onExportAll={() => {
                handleExportPDF();
                handleExportCSV();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
