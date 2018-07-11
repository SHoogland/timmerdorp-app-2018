import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { SearchPage } from '../search/search';
import { ConnectChildToCabinPage } from '../connect-child-to-cabin/connect-child-to-cabin';
import { ConnectChildToCabinStep_2Page } from '../connect-child-to-cabin-step-2/connect-child-to-cabin-step-2';
import { ResultChildrenPage } from '../result-children/result-children';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	barcode: string;
	error: string;
	pages: Array<{
		title: string,
		component: any,
		class: string
	}>;

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
				title: 'Koppel kind aan hut',
				component: ConnectChildToCabinPage,
				class: 'bg-blue'
			},
			{
				title: 'Zoek kind',
				component: SearchPage,
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
