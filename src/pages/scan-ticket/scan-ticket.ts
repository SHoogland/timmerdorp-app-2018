import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as WPAPI from 'wpapi';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@Component({
	selector: 'page-scan-ticket',
	templateUrl: 'scan-ticket.html',
})
export class ScanTicketPage {
	loginError: boolean;
	notLoggedIn: boolean;
	error: string;
	endpoint: string;
	loading: boolean;
	modal: {
		showModal: boolean;
		text: string;
	}
	wristBandError: boolean;
	login: {
		username: string,
		password: string
	};
	ticket: {
		barcode: string;
		firstName: string,
		lastName: string,
		birthDate: string,
		wristBandNr: string
	};

	barcode: string;

	constructor(
		private barcodeScanner: BarcodeScanner,
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public storage: Storage
	) {
		this.endpoint = 'https://staging.timmerdorp.com/wp-json';
		this.init();
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}

		this.barcode = '';

		this.ticket = {
			barcode: '',
			firstName: '',
			lastName: '',
			birthDate: '',
			wristBandNr: ''
		}
		this.loginError = false;
		this.notLoggedIn = false;
		this.loading = true;
		this.modal = {
			text: '',
			showModal: false
		}
		this.wristBandError = false;
	}

	getWpApi(route) {
		var wp = new WPAPI({
			endpoint: this.endpoint,
			username: this.login.username,
			password: this.login.password
		});

		wp.handler = wp.registerRoute('tickets', route, {});

		return wp;
	}

	ionViewDidLoad() {
		let self = this;

		this.init();
		
		this.barcodeScanner.scan().then(barcodeData => {
			console.log('Barcode data', barcodeData);
			this.barcode = barcodeData.text;
			Promise.all([
				this.storage.get('username').then((val) => {
					this.login.username = val;
				}, (error) => {
					this.login.username = '';
				}),
				this.storage.get('password').then((val) => {
					this.login.password = val;
				}, (error) => {
					this.login.password = '';
				})
			]).then(() => {
				var wp = this.getWpApi('barcode');
				return wp.handler().param('barcode', this.barcode);
			}).then((result) => {
				if (result.code === 200) {
					self.ticket.barcode = result.meta.WooCommerceEventsTicketID[0];
					self.ticket.firstName = result.meta.WooCommerceEventsAttendeeName[0];
					self.ticket.lastName = result.meta.WooCommerceEventsAttendeeLastName[0];
					self.ticket.birthDate = result.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)'][0];

					if (result.meta.wristband) {
						self.modal.showModal = true;
						self.ticket.wristBandNr = result.meta.wristband[0];
						self.modal.text = 'Dit ticket heeft al een armband!';
					}

					self.loading = false;
				} else {
					if (result.message == 'access denied') {
						this.notLoggedIn = true;
					} else {
						self.error = result.message;
						self.loading = false;
					}
				}
			}).catch((error) => {
				if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
					this.loginError = true;
				} else {
					self.error = error.message;
				}
				self.loading = false;
			});
		}).catch(err => {
			console.log('Error', err);
		});
	}

	saveTicket() {
		let self = this;
		self.loading = true;

		var wp = this.getWpApi('add-wristband');
		wp
			.handler()
			.param('barcode', this.barcode)
			.param('wristband', this.ticket.wristBandNr)
			.then((result) => {
				console.log(result);
				if (result.code === 200) {
					self.goBack();
				} else {
					self.error = result.message;
					self.loading = false;
				}
			}).catch((error) => {
				console.log(error);
			});
	}

	goBack() {
		this.navCtrl.setRoot(HomePage);
	}

	toLogin() {
		this.navCtrl.setRoot(LoginPage);
	}
}
