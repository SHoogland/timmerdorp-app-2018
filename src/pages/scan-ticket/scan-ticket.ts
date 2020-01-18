import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as WPAPI from 'wpapi';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

declare let cordova: any;

@Component({
	selector: 'page-scan-ticket',
	templateUrl: 'scan-ticket.html',
})
export class ScanTicketPage {
	wristBandError: boolean;
	loading: boolean;

	oldNumber: string;
	errorHelp: string;
	endpoint: string;
	error: string;

	modal: {
		showModal: boolean;
	}
	login: {
		username: string,
		password: string
	};
	ticket: {
		barcode: string;
		firstName: string,
		lastName: string,
		birthDate: string,
		wristBandNr: string,
		hutNr: string
	};

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public storage: Storage
	) {
		if (this.platform.is('cordova')) {
			if (cordova.platformId === 'android') {
				this.platform.registerBackButtonAction(() => {
					if (this.modal.showModal) {
						this.modal.showModal = false;
					} else {
						this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
					}
				});
			}
		}
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
			wristBandNr: '',
			hutNr: null
		}
		this.error = '';
		this.errorHelp = '';
		this.loading = false;
		this.modal = {
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
			self.loading = false;
			if (result.code === 200) {
				self.ticket.barcode = (result.meta.WooCommerceEventsTicketID || [])[0];
				self.ticket.firstName = (result.meta.WooCommerceEventsAttendeeName || [])[0];
				self.ticket.lastName = (result.meta.WooCommerceEventsAttendeeLastName || [])[0];
				self.ticket.birthDate = (result.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)'] || [])[0];

				if (result.meta.hutnr) self.ticket.hutNr = result.meta.hutnr;

				if (result.meta.wristband) {
					self.ticket.wristBandNr = (result.meta.wristband || [])[0];
					self.oldNumber = self.ticket.wristBandNr;
					self.showModal();
				}
			} else {
				if (result.message == 'access denied') {
					this.error = 'Niet ingelogd';
					this.errorHelp = 'Je moet eerst <a (click)="toLogin()">inloggen</a>.';
				} else {
					if (result.message == 'no ticket found') {
						self.error = 'Geen tickets gevonden';
						self.errorHelp = 'Probeer het ticket opnieuw te scannen.';
					} else if (result.message == 'no barcode provided') {
						self.error = 'Geen barcode gescand';
						self.errorHelp = 'Probeer het ticket opnieuw te scannen in direct zonlicht.';
					} else {
						self.error = result.message;
					}
				}
			}
		}).catch((error) => {
			self.loading = false;
			if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
				this.error = 'Inloggegevens onjuist';
				this.errorHelp = 'Wijzig eerst je inloggegevens <a (click)="toLogin()">hier</a>.';
			} else {
				self.error = error.message;
			}
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
					self.storage.get('editHistory').then((val) => {
						let editHis = val || [];
						let t = self.ticket;
						editHis.unshift({
							name: t.firstName + " " + t.lastName,
							oldNr: self.oldNumber || "onbekend",
							newNr: t.wristBandNr,
							wijk: self.getColor(t.hutNr)
						});
						console.log(editHis);

						self.storage.set("editHistory", editHis);

					});

					self.goHome();
				} else {
					if (result.message == 'wristband already exists') {
						self.error = 'Polsbandje bestaat al';
						self.errorHelp = 'Ieder polsbandnummer mag maar één keer voorkomen.';
					} else {
						self.error = result.message;
					}
					console.log(result.message);
					self.loading = false;
				}
			}).catch((error) => {
				alert(error);
				self.loading = false;
			});
	}

	getColor(w) {
		let res = '#222';
		console.log((w + "")[0])
		switch ((w + "")[0]) {
			case '0':
				res = '#ffc800';
				break;
			case '1':
				res = '#f44336';
				break;
			case '2':
				res = '#2196F3';
				break;
			case '3':
				res = '#9ae263';
				break;
			default:
				res = '#222';
		}
		return res;
	}

	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
	}

	closeModal() {
		this.modal.showModal = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}

	showModal() {
		this.modal.showModal = true;
		document.querySelector('#myModal').classList.add('high');
	}

	goHome() {
		if (this.modal.showModal) {
			let self = this;
			this.modal.showModal = false;
			setTimeout(function () {
				self.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
			}, 200);
		} else {
			this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
		}
	}
}
