export interface OverviewCardsCityData {
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
    quarter: number | null;
    totalSightings: number;
  };
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
