import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as WPAPI from 'wpapi';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

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

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public storage: Storage
	) {
		this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		this.init();
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}
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
			}),
			this.storage.get('staging').then((val) => {
				if (val) {
					this.endpoint = 'https://staging.timmerdorp.com/wp-json';
				} else {
					this.endpoint = 'https://shop.timmerdorp.com/wp-json';
				}
			}, (error) => {
				this.endpoint = 'https://shop.timmerdorp.com/wp-json';
			})
		]).then(() => {
			var wp = this.getWpApi('barcode');
			return wp.handler().param('barcode', this.navParams.get('barcode'));
		}).then((result) => {
			if (result.code === 200) {
				self.ticket.barcode = (result.meta.WooCommerceEventsTicketID||[])[0];
				self.ticket.firstName = (result.meta.WooCommerceEventsAttendeeName||[])[0];
				self.ticket.lastName = (result.meta.WooCommerceEventsAttendeeLastName||[])[0];
				self.ticket.birthDate = (result.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)']||[])[0];

				if (result.meta.wristband) {
					self.modal.showModal = true;
					self.ticket.wristBandNr = (result.meta.wristband||[])[0];
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
	}

	saveTicket() {
		let self = this;
		self.loading = true;

		var wp = this.getWpApi('add-wristband');
		wp
			.handler()
			.param('barcode', this.navParams.get('barcode'))
			.param('wristband', this.ticket.wristBandNr)
			.then((result) => {
				console.log(result);
				if (result.code === 200) {
					var wp = this.getWpApi('presence');
					if (new Date().getDay() == 2) { //if today is tuesday
						wp.handler().param('wristband', self.ticket.wristBandNr).param('day', "tue").param("presence", true).then((result) => {
							console.log("Child presence update successful", result)
							self.goHome();
						});
					}else{
						self.goHome();
					}
				} else {
					self.error = result.message;
					self.loading = false;
				}
			}).catch((error) => {
				alert(error);
				self.loading = false;
			});
	}

	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, direction: 'forward' });
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: "back" });
	}
}
