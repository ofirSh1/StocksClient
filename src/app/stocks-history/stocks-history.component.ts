import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StockHistory } from '../model/stockHistory';
import { StocksService } from '../stocks.service';

@Component({
  selector: 'app-stocks-history',
  templateUrl: './stocks-history.component.html',
  styleUrls: ['./stocks-history.component.css']
})
export class StocksHistoryComponent implements OnInit {

  stocksHistory: Observable<Array<StockHistory>>;
  displayedColumns: string[] = ['date', 'name', 'buyOrSell', 'price', 'quantity'];

  constructor(private stocksService: StocksService) {
    this.stocksHistory = this.stocksService.stocksHistory$;
   }
  ngOnInit() {
  }

}
