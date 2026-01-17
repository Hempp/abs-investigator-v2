'use client';

import { useState, useCallback } from 'react';
import { useUIStore, useCaseStore, useSelectedCase } from '@/stores';
import { AppLayout } from '@/components/layout';
import { InvestigationWizard } from '@/components/investigator';
import { CaseList, CaseDetail } from '@/components/cases';
import { EntityLookup } from '@/components/entity';

type View = 'investigation' | 'cases' | 'case-detail' | 'entity-lookup';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('investigation');
  const { selectCase } = useCaseStore();
  const selectedCase = useSelectedCase();

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
    if (view !== 'case-detail') {
      selectCase(null);
    }
  }, [selectCase]);

  const handleViewCase = useCallback((id: string) => {
    selectCase(id);
    setCurrentView('case-detail');
  }, [selectCase]);

  const handleBackFromCase = useCallback(() => {
    selectCase(null);
    setCurrentView('cases');
  }, [selectCase]);

  const handleNewCase = useCallback(() => {
    setCurrentView('investigation');
  }, []);

  return (
    <AppLayout currentView={currentView} onViewChange={handleViewChange}>
      {currentView === 'investigation' && <InvestigationWizard />}

      {currentView === 'entity-lookup' && <EntityLookup />}

      {currentView === 'cases' && (
        <CaseList onViewCase={handleViewCase} onNewCase={handleNewCase} />
      )}

      {currentView === 'case-detail' && selectedCase && (
        <CaseDetail caseData={selectedCase} onBack={handleBackFromCase} />
      )}
    </AppLayout>
  );
}
