import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';

import { HttpClient } from '@angular/common/http';

import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';


@Component({
	selector: 'page-changeWristband',
	templateUrl: 'change-wristband.html'
})
export class ChangeWristbandPage {
	inputField: any;
	history: any;
	ticket: any;

	errorHelp: string;
	endpoint: string;
	oldNr: string;
	newNr: string;
	error: string;

	searched: boolean;
	loading2: boolean;
	loading: boolean;

	login: {
		username: string,
		password: string
	};
	// @ViewChild('secondInput') secondInput: ElementRef;

	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient,
		public storage: Storage,
		public cd: ChangeDetectorRef
	) {
	}

	init() {
	}

	searchTicket() {
		let self = this;
		this.ticket = {};
		if (this.oldNr.length < 3) {
			this.cd.detectChanges();
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		this.error = '';
		this.ticket = {};
		this.searched = false;
		this.loading2 = false;
		this.loading = true;
		console.log('searching: ' + this.oldNr);
		var wp = this.getWpApi('search');
		wp.handler().param('search', this.oldNr).then((result) => {
			let t = result.tickets;
			t = t.filter(function (a) {
				return a.meta.wristband[0] == self.oldNr;
			});
			if (!t.length) {
				self.error = 'Geen resultaten'
				self.errorHelp = 'Je kunt alleen zoeken op (het oude) polsbandnummer.';
				self.loading = false;
				return;
			}
			t.filter(function (a) {
				return (a.meta || {}).wristband === self.oldNr;
			});
			self.ticket = t[0];
			if (result.code == 200) {
				self.ticket.barcode = (self.ticket.meta.WooCommerceEventsTicketID || [])[0];
				self.ticket.firstName = (self.ticket.meta.WooCommerceEventsAttendeeName || [])[0];
				self.ticket.lastName = (self.ticket.meta.WooCommerceEventsAttendeeLastName || [])[0];
				self.ticket.hutnr = (self.ticket.meta.hutnr || [])[0];
				self.ticket.birthDate = (self.ticket.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)'] || [])[0];
				self.loading = false;
				self.searched = true;
				self.cd.detectChanges();
				setTimeout(function () {
					if (document.getElementById("secondInput")) {
						let el = document.getElementById("secondInput").getElementsByTagName("input")[0];
						console.log(el);
						el.focus();
					}
				}, 250);
			} else {
				if (result.message == 'access denied') {
					this.error = 'Niet ingelogd';
					this.errorHelp = 'Je moet eerst <a (click)="toLogin()">inloggen</a>.';
				} else {
					self.error = result.message;
					self.loading = false;
				}
			}
		}).catch((error) => {
			if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
				this.error = 'Inloggegevens onjuist';
				this.errorHelp = 'Wijzig eerst je inloggegevens <a (click)="toLogin()">hier</a>.';
			} else {
				self.error = error.message;
			}
			self.loading = false;
		});

	}

	valueChanged() {
		if (this.searched) {
			this.searched = false;
			this.loading = false;
			this.ticket = {}
		}
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

	ionViewDidLoad() {
		this.login = {
			username: '',
			password: ''
		}
		this.searched = false;
		this.ticket = {};
		this.loading = false;
		this.error = '';
		this.oldNr = "";
		this.newNr = "";
		this.loading2 = false;
		Promise.all([
			this.storage.get('editHistory').then((val) => {
				this.history = val || [];
				console.log(this.history);
			}, (error) => {
				this.history = [];
			}),
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
			let self = this;
			setInterval(function () {
				console.log(self.newNr);
			}, 200);
			this.init();
		});
	}

	saveNr() {
		this.loading2 = true;
		let self = this;
		var wp = this.getWpApi('add-wristband');
		console.log(this.ticket);

		wp
			.handler()
			.param('barcode', this.ticket.barcode)
			.param('wristband', this.newNr)
			.then((result) => {
				console.log(result);
				let t = self.ticket;
				let m = t.meta;
				self.history.unshift({
					name: m.WooCommerceEventsAttendeeName[0] + " " + m.WooCommerceEventsAttendeeLastName[0],
					oldNr: m.wristband,
					newNr: self.newNr,
					hutnr: m.hutnr
				});
				console.log(self.history);

				self.storage.set("editHistory", self.history);

				if (result.code === 200) {
					self.goHome();
				} else {
					self.error = result.message;
					self.loading2 = false;
				}
			}).catch((error) => {
				console.log(error);
				alert("foutmelding! " + error);
				this.loading2 = false;
			});
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

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
	}

	getWijk(hutNr) {
		console.log(hutNr);
		return 'Rood';
		if (hutNr[0] == '0') {
			return 'Geel';
		} else if (hutNr[0] == '1') {
			return 'Rood';
		} else if (hutNr[0] == '2') {
			return 'Blauw';
		} else if (hutNr[0] == '3') {
			return 'Groen';
		} else {
			return '';
		}
	}
}
