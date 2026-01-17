'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Building2,
  Globe,
  Users,
  FileText,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  MapPin,
  Calendar,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Button,
  Card,
  Input,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Skeleton,
} from '@/components/ui';

interface LEIEntity {
  lei: string;
  entity: {
    legalName: string;
    otherNames?: Array<{ name: string; type: string }>;
    legalAddress: {
      addressLines: string[];
      city: string;
      region?: string;
      country: string;
      postalCode: string;
    };
    headquartersAddress: {
      addressLines: string[];
      city: string;
      region?: string;
      country: string;
      postalCode: string;
    };
    jurisdiction: string;
    category?: string;
    status: string;
  };
  registration: {
    initialRegistrationDate: string;
    lastUpdateDate: string;
    status: string;
    nextRenewalDate: string;
    managingLou: string;
  };
}

interface LEIRelationship {
  type: string;
  startNode: { lei: string; name: string };
  endNode: { lei: string; name: string };
  relationship: { status: string };
}

interface EntityDetails {
  entity: LEIEntity;
  relationships: LEIRelationship[];
  subsidiaries?: LEIEntity[];
  secFilings?: any[];
  securities?: any[];
}

interface SearchResult {
  success: boolean;
  total: number;
  count: number;
  entities: LEIEntity[];
  error?: string;
}

export function EntityLookup() {
  const [searchMode, setSearchMode] = useState<'name' | 'lei'>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchResults, setSearchResults] = useState<LEIEntity[] | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults(null);
    setSelectedEntity(null);

    try {
      if (searchMode === 'lei') {
        // Direct LEI lookup
        const response = await fetch(`/api/lei/${searchQuery.trim().toUpperCase()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'LEI lookup failed');
        }

        setSelectedEntity(data);
        setSearchResults(null);
      } else {
        // Name search
        const params = new URLSearchParams({ q: searchQuery.trim() });
        if (jurisdiction) {
          params.append('jurisdiction', jurisdiction);
        }

        const response = await fetch(`/api/lei/search?${params}`);
        const data: SearchResult = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Search failed');
        }

        setSearchResults(data.entities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchMode, jurisdiction]);

  const handleSelectEntity = useCallback(async (lei: string) => {
    setIsLoadingDetails(true);
    setError(null);

    try {
      const response = await fetch(`/api/lei/${lei}?include=all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load entity details');
      }

      setSelectedEntity(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details');
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatAddress = (address: LEIEntity['entity']['legalAddress']) => {
    const parts = [
      ...address.addressLines,
      address.city,
      address.region,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const formatLEI = (lei: string) => {
    return `${lei.slice(0, 4)}-${lei.slice(4, 8)}-${lei.slice(8, 12)}-${lei.slice(12, 16)}-${lei.slice(16)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'MERGED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Entity Lookup</h1>
                <p className="text-muted-foreground">
                  Search by LEI/GMEI to find entities, subsidiaries, and securities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Controls */}
        <div className="space-y-4">
          <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'name' | 'lei')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="name">Search by Name</TabsTrigger>
              <TabsTrigger value="lei">Search by LEI</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder={
                  searchMode === 'lei'
                    ? 'Enter 20-character LEI (e.g., 8I5DZWZKVSZI1NUHU748)'
                    : 'Enter company name (e.g., JPMorgan, Goldman Sachs)'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12"
              />
            </div>

            {searchMode === 'name' && (
              <div className="w-full md:w-40">
                <Input
                  placeholder="Country (e.g., US)"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="h-12"
                  maxLength={2}
                />
              </div>
            )}

            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="h-12 px-6"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {searchMode === 'lei' && (
            <p className="text-sm text-muted-foreground">
              LEI (Legal Entity Identifier) is a 20-character alphanumeric code that uniquely
              identifies legal entities in financial transactions.
            </p>
          )}
        </div>
      </Card>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 mb-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults && searchResults.length > 0 && !selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4 md:p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Found {searchResults.length} entities
              </h2>
              <div className="space-y-3">
                {searchResults.map((entity) => (
                  <motion.button
                    key={entity.lei}
                    className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors"
                    onClick={() => handleSelectEntity(entity.lei)}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {entity.entity.legalName}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', getStatusColor(entity.entity.status))}
                          >
                            {entity.entity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {formatLEI(entity.lei)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {entity.entity.legalAddress.city}, {entity.entity.legalAddress.country}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {searchResults && searchResults.length === 0 && !selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entities found</h3>
              <p className="text-muted-foreground">
                Try a different search term or check the spelling
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Details */}
      {isLoadingDetails && (
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </Card>
      )}

      {/* Entity Details */}
      <AnimatePresence>
        {selectedEntity && !isLoadingDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Entity Header */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold">
                      {selectedEntity.entity.entity.legalName}
                    </h2>
                    <Badge
                      className={cn(getStatusColor(selectedEntity.entity.entity.status))}
                    >
                      {selectedEntity.entity.entity.status}
                    </Badge>
                  </div>
                  <p className="text-lg font-mono text-muted-foreground mt-1">
                    {formatLEI(selectedEntity.entity.lei)}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {selectedEntity.entity.entity.jurisdiction}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Registered {new Date(selectedEntity.entity.registration.initialRegistrationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEntity(null);
                    setSearchResults(null);
                  }}
                >
                  New Search
                </Button>
              </div>
            </Card>

            {/* Details Tabs */}
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="relationships">
                  Relationships
                  {selectedEntity.relationships && selectedEntity.relationships.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedEntity.relationships.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="subsidiaries">
                  Subsidiaries
                  {selectedEntity.subsidiaries && selectedEntity.subsidiaries.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedEntity.subsidiaries.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="securities">
                  Securities
                  {selectedEntity.secFilings && selectedEntity.secFilings.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedEntity.secFilings.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Legal Address */}
                  <Card className="p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Legal Address
                    </h3>
                    <p className="text-muted-foreground">
                      {formatAddress(selectedEntity.entity.entity.legalAddress)}
                    </p>
                  </Card>

                  {/* Headquarters */}
                  <Card className="p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Headquarters
                    </h3>
                    <p className="text-muted-foreground">
                      {formatAddress(selectedEntity.entity.entity.headquartersAddress)}
                    </p>
                  </Card>

                  {/* Registration Details */}
                  <Card className="p-5 md:col-span-2">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Registration Details
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">{selectedEntity.entity.registration.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Initial Registration</p>
                        <p className="font-medium">
                          {new Date(selectedEntity.entity.registration.initialRegistrationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Update</p>
                        <p className="font-medium">
                          {new Date(selectedEntity.entity.registration.lastUpdateDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Renewal</p>
                        <p className="font-medium">
                          {new Date(selectedEntity.entity.registration.nextRenewalDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="relationships" className="mt-6">
                {selectedEntity.relationships && selectedEntity.relationships.length > 0 ? (
                  <Card className="p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Corporate Relationships
                    </h3>
                    <div className="space-y-4">
                      {selectedEntity.relationships.map((rel, idx) => (
                        <div key={idx} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">
                                {rel.type.replace(/_/g, ' ')}
                              </Badge>
                              <p className="font-medium">{rel.endNode.name || 'Unknown Entity'}</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {rel.endNode.lei}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectEntity(rel.endNode.lei)}
                            >
                              View <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No relationships found</h3>
                    <p className="text-muted-foreground">
                      This entity has no reported parent or consolidated relationships
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="subsidiaries" className="mt-6">
                {selectedEntity.subsidiaries && selectedEntity.subsidiaries.length > 0 ? (
                  <Card className="p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Subsidiary Entities
                    </h3>
                    <div className="space-y-3">
                      {selectedEntity.subsidiaries.map((sub) => (
                        <motion.button
                          key={sub.lei}
                          className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors"
                          onClick={() => handleSelectEntity(sub.lei)}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{sub.entity.legalName}</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {formatLEI(sub.lei)}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {sub.entity.legalAddress.city}, {sub.entity.legalAddress.country}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No subsidiaries found</h3>
                    <p className="text-muted-foreground">
                      This entity has no reported subsidiary companies
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="securities" className="mt-6">
                <div className="space-y-6">
                  {/* SEC Filings */}
                  {selectedEntity.secFilings && selectedEntity.secFilings.length > 0 ? (
                    <Card className="p-5">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        SEC Filings
                      </h3>
                      <div className="space-y-3">
                        {selectedEntity.secFilings.slice(0, 10).map((filing: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{filing.type}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(filing.filedAt || filing.filingDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm mt-1 truncate">
                                  {filing.description || filing.name || 'SEC Filing'}
                                </p>
                              </div>
                              {filing.url && (
                                <a
                                  href={filing.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No SEC filings found</h3>
                      <p className="text-muted-foreground">
                        No ABS/MBS related filings found for this entity
                      </p>
                    </Card>
                  )}

                  {/* Securities */}
                  {selectedEntity.securities && selectedEntity.securities.length > 0 && (
                    <Card className="p-5">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Associated Securities
                      </h3>
                      <div className="space-y-3">
                        {selectedEntity.securities.slice(0, 10).map((security: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{security.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {security.figi && (
                                    <Badge variant="outline" className="text-xs">
                                      FIGI: {security.figi}
                                    </Badge>
                                  )}
                                  {security.cusip && (
                                    <Badge variant="outline" className="text-xs">
                                      CUSIP: {security.cusip}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
