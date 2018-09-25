import { Route } from '@angular/router';
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { BuySellComponent } from './buy-sell/buy-sell.component';
import { StocksHistoryComponent } from './stocks-history/stocks-history.component';
import { StockPortfolioComponent } from './stock-portfolio/stock-portfolio.component';

export const ROUTES: Route[] = [
    {
        path: 'stockPortfolio', component: StockPortfolioComponent
    },
    {
        path: 'stocksHistory', component: StocksHistoryComponent
    },
    {
        path: 'stocksList', component: StocksListComponent
    },
    {
        path: 'buy/:buyOrSell/:stockName', component: BuySellComponent
    },
    {
        path: 'sell/:buyOrSell/:stockName', component: BuySellComponent
    },
    {
        path: '', redirectTo: '', pathMatch: 'full'
    }
];
