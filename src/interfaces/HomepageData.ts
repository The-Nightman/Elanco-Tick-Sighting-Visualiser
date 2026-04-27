import { HistogramData } from "./HistogramData";
import { HorizonData } from "./HorizonData";
import { OverviewCardsHomeData } from "./OverviewCardsHomeData";
import { TickCardData } from "./TickCardData";

export interface HomepageData {
  tickCardData: TickCardData[],
    histogramData: HistogramData[],
    horizonData: HorizonData[],
    overviewCardsData: OverviewCardsHomeData,
}