import { Injectable } from '@angular/core';
import { Stock } from './model/stock';
import { BehaviorSubject, Observable } from 'rxjs';
import { StockInStockPortfolio } from './model/stockInstockPortfolio';
import { StockHistory } from './model/stockHistory';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import * as socketIO from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class StocksService {
  ioClient = socketIO.connect(environment.serverUrl);

  stocks: Array<Stock> = [];
  stocks$: BehaviorSubject<Array<Stock>> = new BehaviorSubject<Array<Stock>>([]);

  stocksInPortfolio: Array<StockInStockPortfolio> = [];
  stocksInPortfolio$: BehaviorSubject<Array<StockInStockPortfolio>> = new BehaviorSubject<Array<StockInStockPortfolio>>([]);

  stocksHistory: Array<StockHistory> = [];
  stocksHistory$: BehaviorSubject<Array<StockHistory>> = new BehaviorSubject<Array<StockHistory>>([]);

  stockToBuyOrSell: Stock | null;

  // -----------------------------------------------------------
  // buy and sell actions
  // http post and put requests to buy new stock, buy more, sell some stocks or sell all
  buyStock(s: Stock, quantity: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const url = `${environment.serverUrl}/stocksPortfolio/${s.name}/?format=json`;
      const req = { stock: s, stockQuantity: quantity };
      try {
        this.http.post<any>(url, JSON.stringify(req)).toPromise().then(result => {
          this.updateStocksPortfolio(result.newStock, result.newHistory);
          resolve();
        });
      } catch (error) {
        reject(error);
      } finally {
        this.stockToBuyOrSell = null;
      }
    });
  }

  sellStock(s: Stock, quantity: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const url = `${environment.serverUrl}/stocksPortfolio/${s.name}/?format=json`;
      const req = { stock: s, stockQuantity: quantity };
      try {
        this.http.put<any>(url, JSON.stringify(req)).toPromise().then(result => {
          if (result.status === 400) {
            reject(result.error);
          } else {
            this.updateStocksPortfolio(result.newStock, result.newHistory);
          }
          resolve();
        }, msg => {
          reject(msg.error);
        });
      } catch (error) {
        reject(error);
      } finally {
        this.stockToBuyOrSell = null;
      }
    });
  }

  private updateStocksPortfolio(newStock: StockInStockPortfolio, newHistory: StockHistory) {
    const stockToChange: StockInStockPortfolio = this.stocksInPortfolio.filter(x => x.name === newStock.name)[0];
    if (stockToChange != null) { // if buy can be null
      const index = this.stocksInPortfolio.indexOf(stockToChange);
      this.stocksInPortfolio.splice(index, 1);
    }
    if (newStock.quantity !== 0) { // if sell can be 0
      this.stocksInPortfolio.push(newStock);
    }
    this.stocksHistory.push(newHistory);

    this.stocksInPortfolio$.next(this.stocksInPortfolio);
    this.stocksHistory$.next(this.stocksHistory);
  }

  getStockInStockPortfolioByName(name: string): Promise<StockInStockPortfolio> {
    const url = `${environment.serverUrl}/stocksPortfolio/${name}`;
    return this.http.get<StockInStockPortfolio>(url).toPromise();
  }
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // get the details of a stock after user pressed buy or sell.
  setStockToBuyOrSell(stockName: string): Promise<Stock> {
    return new Promise<Stock>((resolve, reject) => {
      this.getStockByName(stockName).then(x => {
        this.stockToBuyOrSell = x;
        resolve(x);
      });
    });
  }

  // http get request to search in the list of stocks by name.
  private getStockByName(stockName: string): Promise<Stock> {
    const url = `${environment.serverUrl}/stocks/${stockName}`;
    return this.http.get<Stock>(url).toPromise();
  }
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // http get requests to get all details from stocks, portfolio and history tables.
  private getAllStocks(): Observable<Array<Stock>> {
    return this.http.get<Array<Stock>>(environment.serverUrl + '/stocks');
  }

  private getStockPortfolio(): Observable<Array<StockInStockPortfolio>> {
    return this.http.get<Array<StockInStockPortfolio>>(environment.serverUrl + '/stocksPortfolio');
  }

  private getStocksHistory(): Observable<Array<StockHistory>> {
    return this.http.get<Array<StockHistory>>(environment.serverUrl + '/history');
  }
  // -----------------------------------------------------------

  private subsriceToTables() {
    this.getAllStocks().subscribe(x => {
      this.stocks = x;
      this.stocks$.next(x);
    });

    this.getStockPortfolio().subscribe(x => {
      this.stocksInPortfolio = x;
      this.stocksInPortfolio$.next(x);
    });

    this.getStocksHistory().subscribe(x => {
      this.stocksHistory = x;
      this.stocksHistory$.next(x);
    });
  }

  // update price in stocks list, portfolio and buy/sell form.
  private listenToPriceChanged() {
    this.ioClient.on('priceChanged', stock => {
      const stockToChange: Stock = this.stocks.filter(x => x.name === stock.name)[0];
      stockToChange.currentPrice = stock.currentPrice;
      stockToChange.change = stock.change;
      this.stocks$.next(this.stocks);

      const stockInStockPortfolioToChange: StockInStockPortfolio = this.stocksInPortfolio.filter(x => x.name === stock.name)[0];
      if (stockInStockPortfolioToChange != null) {
        stockInStockPortfolioToChange.gainLoss = this.calculateGainLoss(stockInStockPortfolioToChange, stock.currentPrice);
        stockInStockPortfolioToChange.currentPrice = stock.currentPrice;
        this.stocksInPortfolio$.next(this.stocksInPortfolio);
      }

      if (this.stockToBuyOrSell != null && this.stockToBuyOrSell.name === stock.name) {
        this.stockToBuyOrSell.currentPrice = stock.currentPrice;
      }
    });
  }

  private calculateGainLoss(existingStock: StockInStockPortfolio, currentPrice: number): number {
    return (currentPrice * existingStock.quantity - existingStock.buyingPrice * existingStock.quantity);
  }

  constructor(private http: HttpClient) {
    this.stockToBuyOrSell = null;
    this.subsriceToTables();
    this.listenToPriceChanged();
  }
}
