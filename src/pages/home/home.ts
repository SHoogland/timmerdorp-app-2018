import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { SearchPage } from '../search/search';
import { ConnectChildToCabinPage } from '../connect-child-to-cabin/connect-child-to-cabin';
import { Storage } from '@ionic/storage';
import { PresencePage } from '../presence/presence';
import { LoginPage } from '../login/login';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	error: string;
	pages: Array<{
		title: string,
		component: any,
		class: string
	}>;
	login: {
		username: '',
		password: ''
	};

	constructor(
		public navCtrl: NavController,
		private barcodeScanner: BarcodeScanner,
		public platform: Platform,
		public storage: Storage
	) {
		this.init();
	}

	init() {
		console.log('init');

		this.pages = [
			{
				title: 'Scan Ticket',
				component: ScanTicketPage,
				class: 'bg-blue'
			},
			{
				title: 'Koppel kind aan hut',
				component: ConnectChildToCabinPage,
				class: 'bg-blue'
			},
			{
				title: 'Zoek kind',
				component: SearchPage,
				class: 'bg-blue'
			},
			{
				title: 'Aanwezigheid',
				component: PresencePage,
				class: 'bg-blue'
			},
			{
				title: 'Login',
				component: LoginPage,
				class: 'bg-green'
			}
		];
	}

	ionViewDidLoad() {
		this.init();
	}

	openPage(page) {
		// Reset the content nav to have just this page
		// we wouldn't want the back button to show in this scenario

		this.navCtrl.setRoot(page.component);
	}
}
