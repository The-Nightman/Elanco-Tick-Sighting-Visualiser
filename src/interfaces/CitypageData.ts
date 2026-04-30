import { HistogramData } from "./HistogramData";
import { OverviewCardsCityData } from "./OverviewCardsCityData";
import { StackedHistogramData } from "./StackedHistogramData";
import { TickCardData } from "./TickCardData";

export interface CitypageData {
  tickCardData: TickCardData[];
  histogramData: HistogramData[];
  stackedHistogramData: StackedHistogramData[];
  overviewCardsData: OverviewCardsCityData;
}
