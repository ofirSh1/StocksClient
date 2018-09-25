import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormGroupDirective, NgForm, FormControl, Validator } from '@angular/forms';
import { Stock } from '../model/stock';
import { ActivatedRoute, Router } from '@angular/router';
import { StocksService } from '../stocks.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-buy-sell',
  templateUrl: './buy-sell.component.html',
  styleUrls: ['./buy-sell.component.css']
})

export class BuySellComponent implements OnInit {

  title: string;
  action: string;
  form: FormGroup;
  stockToBuyOrSell: Stock | null;
  maxQuantityToSell: number | null;
  matcher = new MyErrorStateMatcher();

  private buildErrorDialog(e: string) {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      width: '250px',
      height: '150px',
      data: { error: e }
    });
  }

  async save() {
    if (this.form.valid) {
      try {
        if (this.action === 'Buy') {
          await this.stocksService.buyStock(this.stockToBuyOrSell, Number(this.form.get('quantity').value));
        } else {
          await this.stocksService.sellStock(this.stockToBuyOrSell, Number(this.form.get('quantity').value));
        }
      } catch (e) {
        this.buildErrorDialog(e);
      } finally {
        this.stockToBuyOrSell = null;
        this.maxQuantityToSell = null;
        this.router.navigate(['/', 'stockPortfolio']);
      }
    }
  }

  private setDetails() {
    if (this.action === 'Buy') {
      this.title = 'Buy Stocks';
    } else {
      try {
        this.stocksService.getStockInStockPortfolioByName(this.stockToBuyOrSell.name).then(x => {
          if (x != null) {
            this.maxQuantityToSell = x.quantity;
            this.title = 'Sell Stocks';
          } else {
            this.buildErrorDialog('Stock no longer exists in your stock portfolio');
            this.router.navigate(['/', 'stockPortfolio']);
          }
        })
          .catch(e => {
            this.buildErrorDialog('Error');
            this.router.navigate(['/', 'stockPortfolio']);
          });
      } catch (e) {
        this.buildErrorDialog('Error');
        this.router.navigate(['/', 'stockPortfolio']);
      }
    }
  }

  private setForm() {
    if (this.stockToBuyOrSell !== null) {
      this.form = this.fb.group({
        quantity: ['', Validators.compose(
          [Validators.required, Validators.max(this.maxQuantityToSell), Validators.min(1), Validators.pattern('^[0-9]*$')])]
      });
    }
  }

  private async setAll() {
    await this.setDetails();
    await this.setForm();
  }

  constructor(public dialog: MatDialog, private router: Router,
    private stocksService: StocksService, private fb: FormBuilder, private activatedRoute: ActivatedRoute) {
    this.stockToBuyOrSell = null;
    this.maxQuantityToSell = null;
    activatedRoute.params.subscribe(params => {
      this.action = params['buyOrSell'];
      const stockName = params['stockName'];
      this.stocksService.setStockToBuyOrSell(stockName).then(x => {
        this.stockToBuyOrSell = x;
        this.setAll();
      });
    });
  }

  ngOnInit() {
  }
}
