import { HistogramData } from "./HistogramData";
import { OverviewCardsCityData } from "./OverviewCardsCityData";
import { TickCardData } from "./TickCardData";

export interface CitypageData {
  tickCardData: TickCardData[],
    histogramData: HistogramData[],
    overviewCardsData: OverviewCardsCityData,
}