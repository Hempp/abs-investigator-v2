/**
 * GLEIF (Global Legal Entity Identifier Foundation) API Service
 *
 * LEI (Legal Entity Identifier) is a 20-character alphanumeric code
 * that uniquely identifies legal entities in financial transactions.
 *
 * GMEI (Global Market Entity Identifier) is Bloomberg's LEI utility.
 *
 * Free API - No authentication required
 * Docs: https://www.gleif.org/en/lei-data/gleif-api
 */

const GLEIF_API_BASE = 'https://api.gleif.org/api/v1';

export interface LEIRecord {
  lei: string;
  entity: {
    legalName: string;
    otherNames?: Array<{
      name: string;
      type: string;
    }>;
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
    registeredAt?: {
      id: string;
      name: string;
    };
    registeredAs?: string;
    jurisdiction: string;
    category?: string;
    legalForm?: {
      id: string;
      name: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'MERGED' | 'RETIRED' | 'ANNULLED' | 'DUPLICATE';
    expiration?: {
      date: string;
      reason: string;
    };
    successorEntity?: {
      lei: string;
      name: string;
    };
  };
  registration: {
    initialRegistrationDate: string;
    lastUpdateDate: string;
    status: string;
    nextRenewalDate: string;
    managingLou: string;
    validationSources: string;
    validationAuthority?: {
      id: string;
      name: string;
    };
  };
}

export interface LEIRelationship {
  type: 'IS_ULTIMATELY_CONSOLIDATED_BY' | 'IS_DIRECTLY_CONSOLIDATED_BY' | 'IS_INTERNATIONAL_BRANCH_OF' | 'IS_FUND_MANAGED_BY' | 'IS_SUBFUND_OF';
  startNode: {
    lei: string;
    name: string;
  };
  endNode: {
    lei: string;
    name: string;
  };
  relationship: {
    status: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface EntitySecurities {
  lei: string;
  entityName: string;
  securities: Array<{
    type: string;
    identifier: string;
    identifierType: 'CUSIP' | 'ISIN' | 'FIGI';
    name: string;
    status?: string;
  }>;
  issuedDebt: Array<{
    type: string;
    dealName: string;
    cusips: string[];
    issuanceDate?: string;
    totalAmount?: number;
  }>;
}

export interface LEISearchResult {
  success: boolean;
  data?: LEIRecord;
  relationships?: LEIRelationship[];
  error?: string;
}

export interface LEISearchResponse {
  success: boolean;
  total: number;
  records: LEIRecord[];
  error?: string;
}

/**
 * Look up entity by LEI
 */
export async function lookupByLEI(lei: string): Promise<LEISearchResult> {
  try {
    // Validate LEI format (20 alphanumeric characters)
    if (!/^[A-Z0-9]{20}$/.test(lei.toUpperCase())) {
      return {
        success: false,
        error: 'Invalid LEI format. Must be 20 alphanumeric characters.',
      };
    }

    const response = await fetch(`${GLEIF_API_BASE}/lei-records/${lei.toUpperCase()}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'LEI not found',
        };
      }
      throw new Error(`GLEIF API error: ${response.status}`);
    }

    const data = await response.json();
    const attributes = data.data?.attributes;

    if (!attributes) {
      return {
        success: false,
        error: 'Invalid response from GLEIF API',
      };
    }

    const record: LEIRecord = {
      lei: attributes.lei,
      entity: {
        legalName: attributes.entity?.legalName?.name || 'Unknown',
        otherNames: attributes.entity?.otherNames?.map((n: any) => ({
          name: n.name,
          type: n.type,
        })),
        legalAddress: {
          addressLines: attributes.entity?.legalAddress?.addressLines || [],
          city: attributes.entity?.legalAddress?.city || '',
          region: attributes.entity?.legalAddress?.region,
          country: attributes.entity?.legalAddress?.country || '',
          postalCode: attributes.entity?.legalAddress?.postalCode || '',
        },
        headquartersAddress: {
          addressLines: attributes.entity?.headquartersAddress?.addressLines || [],
          city: attributes.entity?.headquartersAddress?.city || '',
          region: attributes.entity?.headquartersAddress?.region,
          country: attributes.entity?.headquartersAddress?.country || '',
          postalCode: attributes.entity?.headquartersAddress?.postalCode || '',
        },
        jurisdiction: attributes.entity?.jurisdiction || '',
        category: attributes.entity?.category,
        status: attributes.entity?.status || 'ACTIVE',
        successorEntity: attributes.entity?.successorEntity ? {
          lei: attributes.entity.successorEntity.lei,
          name: attributes.entity.successorEntity.name,
        } : undefined,
      },
      registration: {
        initialRegistrationDate: attributes.registration?.initialRegistrationDate || '',
        lastUpdateDate: attributes.registration?.lastUpdateDate || '',
        status: attributes.registration?.status || '',
        nextRenewalDate: attributes.registration?.nextRenewalDate || '',
        managingLou: attributes.registration?.managingLou || '',
        validationSources: attributes.registration?.validationSources || '',
      },
    };

    // Get relationships
    const relationships = await getEntityRelationships(lei);

    return {
      success: true,
      data: record,
      relationships,
    };
  } catch (error) {
    console.error('LEI lookup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'LEI lookup failed',
    };
  }
}

/**
 * Search for entities by name
 */
export async function searchByName(name: string, limit: number = 20): Promise<LEISearchResponse> {
  try {
    const params = new URLSearchParams({
      'filter[entity.legalName]': name,
      'page[size]': limit.toString(),
    });

    const response = await fetch(`${GLEIF_API_BASE}/lei-records?${params}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GLEIF API error: ${response.status}`);
    }

    const data = await response.json();

    const records: LEIRecord[] = (data.data || []).map((item: any) => {
      const attributes = item.attributes;
      return {
        lei: attributes.lei,
        entity: {
          legalName: attributes.entity?.legalName?.name || 'Unknown',
          legalAddress: {
            addressLines: attributes.entity?.legalAddress?.addressLines || [],
            city: attributes.entity?.legalAddress?.city || '',
            country: attributes.entity?.legalAddress?.country || '',
            postalCode: attributes.entity?.legalAddress?.postalCode || '',
          },
          headquartersAddress: {
            addressLines: attributes.entity?.headquartersAddress?.addressLines || [],
            city: attributes.entity?.headquartersAddress?.city || '',
            country: attributes.entity?.headquartersAddress?.country || '',
            postalCode: attributes.entity?.headquartersAddress?.postalCode || '',
          },
          jurisdiction: attributes.entity?.jurisdiction || '',
          status: attributes.entity?.status || 'ACTIVE',
        },
        registration: {
          initialRegistrationDate: attributes.registration?.initialRegistrationDate || '',
          lastUpdateDate: attributes.registration?.lastUpdateDate || '',
          status: attributes.registration?.status || '',
          nextRenewalDate: attributes.registration?.nextRenewalDate || '',
          managingLou: attributes.registration?.managingLou || '',
          validationSources: attributes.registration?.validationSources || '',
        },
      };
    });

    return {
      success: true,
      total: data.meta?.pagination?.total || records.length,
      records,
    };
  } catch (error) {
    console.error('LEI search error:', error);
    return {
      success: false,
      total: 0,
      records: [],
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Search for entities by jurisdiction (country)
 */
export async function searchByJurisdiction(
  countryCode: string,
  options?: { name?: string; status?: string; limit?: number }
): Promise<LEISearchResponse> {
  try {
    const params = new URLSearchParams({
      'filter[entity.jurisdiction]': countryCode.toUpperCase(),
      'page[size]': (options?.limit || 20).toString(),
    });

    if (options?.name) {
      params.append('filter[entity.legalName]', options.name);
    }

    if (options?.status) {
      params.append('filter[entity.status]', options.status);
    }

    const response = await fetch(`${GLEIF_API_BASE}/lei-records?${params}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GLEIF API error: ${response.status}`);
    }

    const data = await response.json();

    const records: LEIRecord[] = (data.data || []).map((item: any) => {
      const attributes = item.attributes;
      return {
        lei: attributes.lei,
        entity: {
          legalName: attributes.entity?.legalName?.name || 'Unknown',
          legalAddress: {
            addressLines: attributes.entity?.legalAddress?.addressLines || [],
            city: attributes.entity?.legalAddress?.city || '',
            country: attributes.entity?.legalAddress?.country || '',
            postalCode: attributes.entity?.legalAddress?.postalCode || '',
          },
          headquartersAddress: {
            addressLines: attributes.entity?.headquartersAddress?.addressLines || [],
            city: attributes.entity?.headquartersAddress?.city || '',
            country: attributes.entity?.headquartersAddress?.country || '',
            postalCode: attributes.entity?.headquartersAddress?.postalCode || '',
          },
          jurisdiction: attributes.entity?.jurisdiction || '',
          status: attributes.entity?.status || 'ACTIVE',
        },
        registration: {
          initialRegistrationDate: attributes.registration?.initialRegistrationDate || '',
          lastUpdateDate: attributes.registration?.lastUpdateDate || '',
          status: attributes.registration?.status || '',
          nextRenewalDate: attributes.registration?.nextRenewalDate || '',
          managingLou: attributes.registration?.managingLou || '',
          validationSources: attributes.registration?.validationSources || '',
        },
      };
    });

    return {
      success: true,
      total: data.meta?.pagination?.total || records.length,
      records,
    };
  } catch (error) {
    console.error('LEI jurisdiction search error:', error);
    return {
      success: false,
      total: 0,
      records: [],
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Get entity relationships (parent/child companies)
 */
export async function getEntityRelationships(lei: string): Promise<LEIRelationship[]> {
  try {
    const response = await fetch(
      `${GLEIF_API_BASE}/lei-records/${lei.toUpperCase()}/direct-parent`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
        },
      }
    );

    if (!response.ok) {
      // No parent relationship is not an error
      if (response.status === 404) {
        return [];
      }
      return [];
    }

    const data = await response.json();
    const relationships: LEIRelationship[] = [];

    // Process direct parent
    if (data.data) {
      const parent = data.data;
      relationships.push({
        type: 'IS_DIRECTLY_CONSOLIDATED_BY',
        startNode: {
          lei: lei.toUpperCase(),
          name: '', // Will be filled by caller
        },
        endNode: {
          lei: parent.attributes?.lei || '',
          name: parent.attributes?.entity?.legalName?.name || '',
        },
        relationship: {
          status: 'ACTIVE',
        },
      });
    }

    // Also try to get ultimate parent
    try {
      const ultimateResponse = await fetch(
        `${GLEIF_API_BASE}/lei-records/${lei.toUpperCase()}/ultimate-parent`,
        {
          headers: {
            'Accept': 'application/vnd.api+json',
          },
        }
      );

      if (ultimateResponse.ok) {
        const ultimateData = await ultimateResponse.json();
        if (ultimateData.data && ultimateData.data.attributes?.lei !== relationships[0]?.endNode.lei) {
          relationships.push({
            type: 'IS_ULTIMATELY_CONSOLIDATED_BY',
            startNode: {
              lei: lei.toUpperCase(),
              name: '',
            },
            endNode: {
              lei: ultimateData.data.attributes?.lei || '',
              name: ultimateData.data.attributes?.entity?.legalName?.name || '',
            },
            relationship: {
              status: 'ACTIVE',
            },
          });
        }
      }
    } catch {
      // Ultimate parent lookup failed, continue
    }

    return relationships;
  } catch (error) {
    console.error('Relationship lookup error:', error);
    return [];
  }
}

/**
 * Get all child entities (subsidiaries) of an LEI
 */
export async function getChildEntities(lei: string): Promise<LEIRecord[]> {
  try {
    const params = new URLSearchParams({
      'filter[relationship.relationship.type]': 'IS_DIRECTLY_CONSOLIDATED_BY',
      'filter[relationship.endNode.id]': lei.toUpperCase(),
      'page[size]': '100',
    });

    const response = await fetch(`${GLEIF_API_BASE}/lei-records?${params}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.data || []).map((item: any) => {
      const attributes = item.attributes;
      return {
        lei: attributes.lei,
        entity: {
          legalName: attributes.entity?.legalName?.name || 'Unknown',
          legalAddress: {
            addressLines: attributes.entity?.legalAddress?.addressLines || [],
            city: attributes.entity?.legalAddress?.city || '',
            country: attributes.entity?.legalAddress?.country || '',
            postalCode: attributes.entity?.legalAddress?.postalCode || '',
          },
          headquartersAddress: {
            addressLines: attributes.entity?.headquartersAddress?.addressLines || [],
            city: attributes.entity?.headquartersAddress?.city || '',
            country: attributes.entity?.headquartersAddress?.country || '',
            postalCode: attributes.entity?.headquartersAddress?.postalCode || '',
          },
          jurisdiction: attributes.entity?.jurisdiction || '',
          status: attributes.entity?.status || 'ACTIVE',
        },
        registration: {
          initialRegistrationDate: attributes.registration?.initialRegistrationDate || '',
          lastUpdateDate: attributes.registration?.lastUpdateDate || '',
          status: attributes.registration?.status || '',
          nextRenewalDate: attributes.registration?.nextRenewalDate || '',
          managingLou: attributes.registration?.managingLou || '',
          validationSources: attributes.registration?.validationSources || '',
        },
      };
    });
  } catch (error) {
    console.error('Child entities lookup error:', error);
    return [];
  }
}

/**
 * Get all securities and debts associated with an entity
 * Combines LEI data with SEC EDGAR and OpenFIGI lookups
 */
export async function getEntitySecurities(lei: string): Promise<EntitySecurities | null> {
  const leiResult = await lookupByLEI(lei);

  if (!leiResult.success || !leiResult.data) {
    return null;
  }

  // This would be enhanced with actual SEC EDGAR and OpenFIGI lookups
  // For now, return the entity info with placeholders
  return {
    lei,
    entityName: leiResult.data.entity.legalName,
    securities: [],
    issuedDebt: [],
  };
}

/**
 * Validate LEI checksum
 */
export function validateLEI(lei: string): boolean {
  if (!/^[A-Z0-9]{20}$/.test(lei.toUpperCase())) {
    return false;
  }

  // LEI uses ISO 17442 checksum (MOD 97-10)
  const leiUpper = lei.toUpperCase();
  let numericLEI = '';

  for (const char of leiUpper) {
    if (char >= '0' && char <= '9') {
      numericLEI += char;
    } else {
      // Convert A-Z to 10-35
      numericLEI += (char.charCodeAt(0) - 55).toString();
    }
  }

  // Check modulo 97
  let remainder = 0;
  for (const digit of numericLEI) {
    remainder = (remainder * 10 + parseInt(digit)) % 97;
  }

  return remainder === 1;
}

/**
 * Format LEI for display
 */
export function formatLEI(lei: string): string {
  const clean = lei.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length !== 20) return lei;
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16)}`;
}
