import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { HomePage } from '../home/home';
import { GlobalFunctions } from '../../providers/global';

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
	error: string;
	title: string;

	modal: {
		showModal: boolean;
	}

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
		public storage: Storage,
		public g: GlobalFunctions
	) {
		this.title = 'Gegevens Ticket';
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
	}

	ionViewDidLoad() {
		let self = this;

		// Promise.all([
		// ]).then(() => {
		// 	var wp = this.g.getWpApi(this.login, this.staging, 'barcode');
		// 	return wp.handler().param('barcode', this.navParams.get('barcode'));
		// }).then((result) => {
		// 	self.loading = false;
		// 	if (result.code === 200) {
		// 		self.ticket.barcode = (result.meta.WooCommerceEventsTicketID || [])[0];
		// 		self.ticket.firstName = (result.meta.WooCommerceEventsAttendeeName || [])[0];
		// 		self.ticket.lastName = (result.meta.WooCommerceEventsAttendeeLastName || [])[0];
		// 		self.ticket.birthDate = (result.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)'] || [])[0];

		// 		if (result.meta.hutnr) self.ticket.hutNr = result.meta.hutnr;

		// 		if (result.meta.wristband) {
		// 			self.ticket.wristBandNr = (result.meta.wristband || [])[0];
		// 			self.oldNumber = self.ticket.wristBandNr;
		// 			self.showModal();
		// 		}
		// 	} else {
		// 		if (result.message == 'access denied') {
		// 			this.error = 'Niet ingelogd';
		// 			this.errorHelp = 'Je moet eerst <a (click)="g.toLogin()">inloggen</a>.';
		// 		} else {
		// 			if (result.message == 'no ticket found') {
		// 				self.error = 'Niets gevonden!';
		// 				self.errorHelp = 'Probeer het ticket opnieuw te scannen.';
		// 			} else if (result.message == 'no barcode provided') {
		// 				self.error = 'Niets gescand!';
		// 				self.errorHelp = 'Probeer het ticket opnieuw te scannen in direct zonlicht.';
		// 			} else {
		// 				self.error = result.message;
		// 			}
		// 		}
		// 	}
		// }).catch((error) => {
		// 	self.loading = false;
		// 	if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
		// 		this.error = 'Inloggegevens onjuist';
		// 		this.errorHelp = 'Wijzig eerst je inloggegevens <a (click)="toLogin()">hier</a>.';
		// 	} else {
		// 		self.error = error.message;
		// 	}
		// });
	}

	saveTicket() {
		let self = this;
		self.loading = true;

		// var wp = this.g.getWpApi(this.login, this.staging, 'add-wristband');
		// wp
		// 	.handler()
		// 	.param('barcode', this.navParams.get('barcode'))
		// 	.param('wristband', this.ticket.wristBandNr)
		// 	.then((result) => {
		// 		console.log(result);
		// 		if (result.code === 200) {
		// 			self.storage.get('editHistory').then((val) => {
		// 				let editHis = val || [];
		// 				let t = self.ticket;
		// 				editHis.unshift({
		// 					name: t.firstName + " " + t.lastName,
		// 					oldNr: self.oldNumber || "onbekend",
		// 					newNr: t.wristBandNr,
		// 					wijk: self.g.getColor(t.hutNr)
		// 				});
		// 				console.log(editHis);

		// 				self.storage.set("editHistory", editHis);

		// 			});

		// 			self.goHome();
		// 		} else {
		// 			if (result.message == 'wristband already exists') {
		// 				self.error = 'Polsbandje bestaat al';
		// 				self.errorHelp = 'Ieder polsbandnummer mag maar één keer voorkomen.';
		// 			} else {
		// 				self.error = result.message;
		// 			}
		// 			console.log(result.message);
		// 			self.loading = false;
		// 		}
		// 	}).catch((error) => {
		// 		alert(error);
		// 		self.loading = false;
		// 	});
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
				self.navCtrl.setRoot(HomePage, {}, self.g.backwardsNavigationSettings);
			}, 200);
		} else {
			this.navCtrl.setRoot(HomePage, {}, this.g.backwardsNavigationSettings);
		}
	}
}
