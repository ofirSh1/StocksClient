import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Stock } from '../model/stock';
import { StocksService } from '../stocks.service';
import { Router } from '../../../node_modules/@angular/router';


@Component({
  selector: 'app-stocks-list',
  templateUrl: './stocks-list.component.html',
  styleUrls: ['./stocks-list.component.css']
})
export class StocksListComponent implements OnInit {

  stocks: Observable<Array<Stock>>;
  displayedColumns: string[] = ['name', 'openedPrice', 'currentPrice', 'change', 'changePercent', 'actions'];

  isChangeUp(change: number): boolean {
    return change >= 0;
  }

  calculatePercent(currentPrice: number, openedPrice: number): number {
    return (currentPrice - openedPrice) / openedPrice;
  }

  buyStock(name: string) {
    this.router.navigate(['/', 'buy', 'Buy', name]);
  }
  sellStock(name: string) {
    this.router.navigate(['/', 'sell', 'Sell', name]);
  }

  constructor(private router: Router, private stocksService: StocksService) {
    this.stocks = this.stocksService.stocks$;
  }

  ngOnInit() {
  }

}
