import { Component, OnInit } from '@angular/core';
import { StockInStockPortfolio } from '../model/stockInstockPortfolio';
import { Observable } from 'rxjs';
import { StocksService } from '../stocks.service';
import { Router } from '../../../node_modules/@angular/router';

@Component({
  selector: 'app-stock-portfolio',
  templateUrl: './stock-portfolio.component.html',
  styleUrls: ['./stock-portfolio.component.css']
})
export class StockPortfolioComponent implements OnInit {

  stocksInPortfolio: Observable<Array<StockInStockPortfolio>>;
  stocksInPortfolioArray: Array<StockInStockPortfolio>;
  displayedColumns: string[] = ['name', 'currentPrice', 'buyingPrice', 'quantity', 'gainLoss', 'actions'];

  buyStock(name: string) {
    this.router.navigate(['/', 'buy', 'Buy', name]);
  }

  sellStock(name: string) {
    this.router.navigate(['/', 'sell', 'Sell', name]);
  }

  getTotalGainLoss(): number {
    let total = 0;
    this.stocksInPortfolio.subscribe(x => {
      x.forEach(element => {
        total += element.gainLoss;
      });
    });
    return total;
  }

  constructor(private router: Router, private stocksService: StocksService) {
    this.stocksInPortfolio = this.stocksService.stocksInPortfolio$;
  }

  ngOnInit() {
  }
}
