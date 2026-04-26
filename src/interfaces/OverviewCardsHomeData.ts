export interface OverviewCardsHomeData {
  sightingsReports: {
    sightingsPastMonth: number;
    sightingsPastQuarter: number;
    sightingsPastYear: number;
    reportsThisWeek: number;
  };
  trendData: {
    pastMonth: {
      percentageChange: number;
      trend: string;
    };
    pastSixMonths: {
      percentageChange: number;
      trend: string;
    };
    pastYear: {
      percentageChange: number;
      trend: string;
    };
  };
  peakSeason: {
    quarter: number;
    totalSightings: number;
  };
  topRisingLocations: {
    location: string;
    recentCount: number;
    previousCount: number;
    rateOfChange: number | null;
  }[];
  mostAffectedSpecies: {
    yearMostAffectedSpecies: {
      speciesName: string | null;
      sightingCount: number;
    };
    maxMostAffectedSpecies: {
      speciesName: string | null;
      sightingCount: number;
    };
  };
}
