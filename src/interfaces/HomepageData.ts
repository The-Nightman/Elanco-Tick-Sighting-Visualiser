import { HistogramData } from "./HistogramData";
import { HorizonData } from "./HorizonData";
import { OverviewCardsHomeData } from "./OverviewCardsHomeData";
import { StackedHistogramData } from "./StackedHistogramData";
import { TickCardData } from "./TickCardData";

export interface HomepageData {
  tickCardData: TickCardData[],
    histogramData: HistogramData[],
    stackedHistogramData: StackedHistogramData[],
    horizonData: HorizonData[],
    overviewCardsData: OverviewCardsHomeData,
}