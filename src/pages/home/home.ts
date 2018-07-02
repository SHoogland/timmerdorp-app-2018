import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { SearchPage } from '../search/search';

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

	this.pages = [
		{
			title: 'Scan Ticket',
			component: ScanTicketPage,
			class: 'bg-yellow'
		},
		{
			title: 'Zoek kind',
			component: SearchPage,
			class: 'bg-blue'
		},
		{
			title: 'Koppel kind aan hut',
			class: 'bg-green'
		}
	];

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
	openPage(page) {
      // Reset the content nav to have just this page
      // we wouldn't want the back button to show in this scenario

      this.navCtrl.setRoot(page.component);
    }
  }
