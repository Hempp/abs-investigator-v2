import { ServicersDatabase, Servicer, DebtTypeId } from '@/types';

export const SERVICERS_DB: ServicersDatabase = {
  mortgage: {
    nationstar: {
      id: 'nationstar',
      name: 'Nationstar Mortgage (Mr. Cooper)',
      address: '8950 Cypress Waters Blvd, Coppell, TX 75019',
      trusts: ['RMBS', 'GSAMP', 'CWABS', 'RALI', 'GSAA'],
    },
    ocwen: {
      id: 'ocwen',
      name: 'Ocwen Loan Servicing',
      address: '1661 Worthington Rd, West Palm Beach, FL 33409',
      trusts: ['WAMU', 'WMALT', 'INDX', 'OPTM'],
    },
    shellpoint: {
      id: 'shellpoint',
      name: 'Shellpoint Mortgage Servicing',
      address: '55 Beattie Place, Greenville, SC 29601',
      trusts: ['RMBS', 'JPMMT', 'CSMC', 'BSABS'],
    },
    phh: {
      id: 'phh',
      name: 'PHH Mortgage',
      address: '1 Mortgage Way, Mt Laurel, NJ 08054',
      trusts: ['MSM', 'MLMI', 'CWABS', 'RAST'],
    },
    sps: {
      id: 'sps',
      name: 'Select Portfolio Servicing',
      address: '3217 S Decker Lake Dr, Salt Lake City, UT 84119',
      trusts: ['BCAP', 'SARM', 'CWALT', 'GSAMP'],
    },
    carrington: {
      id: 'carrington',
      name: 'Carrington Mortgage Services',
      address: '1600 S Douglass Rd, Anaheim, CA 92806',
      trusts: ['CARR', 'NCMT', 'SABR', 'CSMC'],
    },
    cenlar: {
      id: 'cenlar',
      name: 'Cenlar FSB',
      address: '425 Phillips Blvd, Ewing, NJ 08618',
      trusts: ['RMBS', 'GSAMP', 'CWABS'],
    },
    specialized: {
      id: 'specialized',
      name: 'Specialized Loan Servicing',
      address: '8742 Lucent Blvd, Highlands Ranch, CO 80129',
      trusts: ['SLSR', 'RMBS', 'GSAMP'],
    },
    bsi: {
      id: 'bsi',
      name: 'BSI Financial Services',
      address: '314 S Franklin St, Titusville, PA 16354',
      trusts: ['RMBS', 'CWABS', 'GSAMP'],
    },
  },
  auto: {
    santander: {
      id: 'santander',
      name: 'Santander Consumer USA',
      address: '1601 Elm St, Dallas, TX 75201',
      trusts: ['SDART', 'DRIVE', 'SCUSA'],
    },
    ally: {
      id: 'ally',
      name: 'Ally Financial',
      address: '500 Woodward Ave, Detroit, MI 48226',
      trusts: ['ALLY', 'AMCAR', 'GMCA'],
    },
    capital_one: {
      id: 'capital_one',
      name: 'Capital One Auto Finance',
      address: '15000 Capital One Dr, Richmond, VA 23238',
      trusts: ['COAFT', 'COMT'],
    },
    carmax: {
      id: 'carmax',
      name: 'CarMax Auto Finance',
      address: '12800 Tuckahoe Creek Pkwy, Richmond, VA 23238',
      trusts: ['CARMX'],
    },
    westlake: {
      id: 'westlake',
      name: 'Westlake Financial',
      address: '4751 Wilshire Blvd, Los Angeles, CA 90010',
      trusts: ['WLAKE', 'DT'],
    },
    exeter: {
      id: 'exeter',
      name: 'Exeter Finance',
      address: '225 N Pottstown Pike, Exton, PA 19341',
      trusts: ['EXTRN', 'EXETER'],
    },
  },
  utility: {
    aps: {
      id: 'aps',
      name: 'Arizona Public Service',
      address: '400 N 5th St, Phoenix, AZ 85004',
      trusts: ['APSUT'],
    },
    duke: {
      id: 'duke',
      name: 'Duke Energy',
      address: '526 S Church St, Charlotte, NC 28202',
      trusts: ['DKEUT'],
    },
    pge: {
      id: 'pge',
      name: 'Pacific Gas and Electric',
      address: '77 Beale St, San Francisco, CA 94105',
      trusts: ['PGEUR'],
    },
    southern: {
      id: 'southern',
      name: 'Southern Company',
      address: '30 Ivan Allen Jr Blvd NW, Atlanta, GA 30308',
      trusts: ['SOUTL'],
    },
    nrg: {
      id: 'nrg',
      name: 'NRG Energy',
      address: '804 Carnegie Center, Princeton, NJ 08540',
      trusts: ['NRGUT'],
    },
  },
  creditCard: {
    synchrony: {
      id: 'synchrony',
      name: 'Synchrony Financial',
      address: '777 Long Ridge Rd, Stamford, CT 06902',
      trusts: ['SYNCC', 'GECCN'],
    },
    discover: {
      id: 'discover',
      name: 'Discover Financial Services',
      address: '2500 Lake Cook Rd, Riverwoods, IL 60015',
      trusts: ['DCENT', 'DCMT'],
    },
    citi: {
      id: 'citi',
      name: 'Citibank',
      address: '388 Greenwich St, New York, NY 10013',
      trusts: ['CITCC', 'CBMT'],
    },
    chase: {
      id: 'chase',
      name: 'Chase Bank',
      address: '270 Park Ave, New York, NY 10017',
      trusts: ['CHAIT', 'JPMCC'],
    },
    amex: {
      id: 'amex',
      name: 'American Express',
      address: '200 Vesey St, New York, NY 10285',
      trusts: ['AMXCA', 'AMXMT'],
    },
    capitalone: {
      id: 'capitalone',
      name: 'Capital One',
      address: '1680 Capital One Dr, McLean, VA 22102',
      trusts: ['COMET', 'COMT'],
    },
  },
  studentLoan: {
    navient: {
      id: 'navient',
      name: 'Navient (formerly Sallie Mae)',
      address: '123 Justison St, Wilmington, DE 19801',
      trusts: ['SLABS', 'NAVSL', 'NCSLT'],
    },
    nelnet: {
      id: 'nelnet',
      name: 'Nelnet',
      address: '121 S 13th St, Lincoln, NE 68508',
      trusts: ['NELLT', 'NLSLT'],
    },
    sofi: {
      id: 'sofi',
      name: 'SoFi',
      address: '234 1st St, San Francisco, CA 94105',
      trusts: ['SOFSL', 'SFIST'],
    },
    commonbond: {
      id: 'commonbond',
      name: 'CommonBond',
      address: '370 Lexington Ave, New York, NY 10017',
      trusts: ['CBSLT', 'CBOND'],
    },
    earnest: {
      id: 'earnest',
      name: 'Earnest',
      address: '535 Mission St, San Francisco, CA 94105',
      trusts: ['ERNST', 'ESLMT'],
    },
    great_lakes: {
      id: 'great_lakes',
      name: 'Great Lakes',
      address: '2401 International Ln, Madison, WI 53704',
      trusts: ['GLSLT', 'GLABS'],
    },
  },
  personalLoan: {
    lending_club: {
      id: 'lending_club',
      name: 'LendingClub',
      address: '595 Market St, San Francisco, CA 94105',
      trusts: ['LCLUB', 'LCIT'],
    },
    prosper: {
      id: 'prosper',
      name: 'Prosper Marketplace',
      address: '221 Main St, San Francisco, CA 94105',
      trusts: ['PROSP', 'PMIT'],
    },
    sofi_personal: {
      id: 'sofi_personal',
      name: 'SoFi Personal Loans',
      address: '234 1st St, San Francisco, CA 94105',
      trusts: ['SOFPL', 'SFPLT'],
    },
    upstart: {
      id: 'upstart',
      name: 'Upstart',
      address: '2950 S Delaware St, San Mateo, CA 94403',
      trusts: ['UPST', 'UPSLT'],
    },
    avant: {
      id: 'avant',
      name: 'Avant',
      address: '222 N LaSalle St, Chicago, IL 60601',
      trusts: ['AVANT', 'AVNT'],
    },
    marcus: {
      id: 'marcus',
      name: 'Marcus by Goldman Sachs',
      address: '200 West St, New York, NY 10282',
      trusts: ['GSPL', 'MARCPL'],
    },
  },
  medical: {
    portfolio_recovery: {
      id: 'portfolio_recovery',
      name: 'Portfolio Recovery Associates',
      address: '120 Corporate Blvd, Norfolk, VA 23502',
      trusts: ['PRAA', 'PRAMS'],
    },
    encore: {
      id: 'encore',
      name: 'Encore Capital Group',
      address: '3111 Camino Del Rio N, San Diego, CA 92108',
      trusts: ['ECMG', 'MDCBS'],
    },
    transworld: {
      id: 'transworld',
      name: 'Transworld Systems',
      address: '545 W 45th St, New York, NY 10036',
      trusts: ['TSWMD', 'TSMC'],
    },
    convergent: {
      id: 'convergent',
      name: 'Convergent Healthcare',
      address: '950 S Cherry St, Denver, CO 80246',
      trusts: ['CVGHC', 'CONVMED'],
    },
    r1rcm: {
      id: 'r1rcm',
      name: 'R1 RCM',
      address: '401 N Michigan Ave, Chicago, IL 60611',
      trusts: ['R1RCM', 'ACMDBT'],
    },
  },
  telecom: {
    att_collections: {
      id: 'att_collections',
      name: 'AT&T Collections',
      address: '208 S Akard St, Dallas, TX 75202',
      trusts: ['ATTRC', 'ATTABS'],
    },
    verizon_collections: {
      id: 'verizon_collections',
      name: 'Verizon Collections',
      address: '1 Verizon Way, Basking Ridge, NJ 07920',
      trusts: ['VZWRC', 'VZABS'],
    },
    tmobile_collections: {
      id: 'tmobile_collections',
      name: 'T-Mobile Collections',
      address: '12920 SE 38th St, Bellevue, WA 98006',
      trusts: ['TMORC', 'TMABS'],
    },
    sprint_collections: {
      id: 'sprint_collections',
      name: 'Sprint Collections',
      address: '6200 Sprint Pkwy, Overland Park, KS 66251',
      trusts: ['SPTRC', 'SPTABS'],
    },
    comcast_collections: {
      id: 'comcast_collections',
      name: 'Comcast Collections',
      address: '1701 JFK Blvd, Philadelphia, PA 19103',
      trusts: ['CMCRC', 'CMCABS'],
    },
  },
};

export const getServicersByDebtType = (debtType: DebtTypeId): Record<string, Servicer> => {
  return SERVICERS_DB[debtType] || {};
};

export const getServicer = (debtType: DebtTypeId, servicerId: string): Servicer | undefined => {
  return SERVICERS_DB[debtType]?.[servicerId];
};

export const getServicerName = (debtType: DebtTypeId, servicerId: string): string => {
  return SERVICERS_DB[debtType]?.[servicerId]?.name || servicerId;
};

export const getAllServicersForDebtType = (debtType: DebtTypeId): Servicer[] => {
  return Object.values(SERVICERS_DB[debtType] || {});
};

export const getServicerAddress = (debtType: DebtTypeId, servicerId: string): string => {
  return SERVICERS_DB[debtType]?.[servicerId]?.address || '';
};

export const getServicerTrusts = (debtType: DebtTypeId, servicerId: string): string[] => {
  return SERVICERS_DB[debtType]?.[servicerId]?.trusts || [];
};
