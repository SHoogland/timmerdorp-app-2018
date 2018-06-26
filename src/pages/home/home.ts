import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  barcode: string;
  error: string;
  constructor(
    public navCtrl: NavController,
    private barcodeScanner: BarcodeScanner 
  ) {

  }

  scanCode() {
    console.log('scan the shizzle');
		this.barcodeScanner.scan().then((barcodeData) => {
			this.barcode = barcodeData.text;
		}, (error) => {
      console.log(error);
			this.error = error.message;
		});
	}

}
