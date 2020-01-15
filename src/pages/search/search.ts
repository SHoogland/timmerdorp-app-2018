import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';

import { HomePage } from '../home/home';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { LoginPage } from '../login/login';
import { DomSanitizer } from '@angular/platform-browser';

declare let cordova: any;

@Component({
	selector: 'page-search',
	templateUrl: 'search.html',
})
export class SearchPage {
	tableCategories: any;
	typingTimer: any;
	timeOut: any;
	tickets: any;
	history: any;

	loading: boolean;

	searchTerm: string;
	endpoint: string;
	error: string;
	errorHelp: string;

	modal: {
		showModal: boolean;
		child: any;
	}
	login: {
		username: string,
		password: string
	};

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public storage: Storage,
		public sanitizer: DomSanitizer
	) {
		console.log(this);
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
		this.modal = {
			child: null,
			showModal: false
		}

		this.timeOut = setTimeout;

		this.loading = false;

		this.error = '';
		this.errorHelp = '';

		this.tableCategories = [
			{
				name: "Gegevens huisarts",
				items: [
					{
						title: "Naam huisarts",
						name: "fooevents_custom_naam_huisarts"
					},
					{
						title: "Tel. huisarts",
						name: "fooevents_custom_telefoonnr_huisarts",
						tel: true
					}
				]
			},
			{
				name: "Contactgegevens ouders",
				items: [
					{
						title: "Tel. ouder 1",
						name: "fooevents_custom_telefoonnr_ouders",
						tel: true
					},
					{
						title: "Tel. ouder 2",
						name: "fooevents_custom_telefoonnr_ouders_(2)",
						tel: true
					},
					{
						title: "E-mailadres",
						name: "WooCommerceEventsPurchaserEmail",
						mail: true
					}
				]
			},
			{
				name: "Gegevens Kind",
				items: [
					{
						title: "Geboortedatum",
						name: "fooevents_custom_geboortedatum_(dd-mm-jjjj)"
					},
					{
						title: "Bandje",
						name: "wristband"
					},
					{
						title: "Hutnummer",
						name: "hutnr"
					},
					{
						title: "Wijk",
						name: ""
					},
					{
						title: "Opmerkingen",
						name: "fooevents_custom_opmerkingen,_allergien"
					}
				]
			},
			{
				name: "Aanwezigheid",
				items: [
					{
						title: "Dinsdag",
						day: "tue"
					},
					{
						title: "Woensdag",
						day: "wed"
					},
					{
						title: "Donderdag",
						day: "thu"
					},
					{
						title: "Vrijdag",
						day: "fri"
					},
				]
			}
		]
		this.tickets = [];
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
		this.init();

		Promise.all([
			this.storage.get('searchChildHistory').then((val) => {
				this.history = val || [];
				this.filterHistory();
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
		});
	}

	getWijk(hutNr) {
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

	search() {
		try {
			clearTimeout(this.typingTimer);
			this.typingTimer = setTimeout(() => {
				this.searchThis();
			}, 200);
		} catch (e) {
			console.log(e);
		}
	}

	filterPhoneNr(num) {
		return (num || [""])[0].replace(/[^0-9+]/g, '');
	}

	filterHistory() {
		let seenChildren = [];
		this.history = this.history.filter(function (a) {
			if (seenChildren.indexOf(a.wristband[0]) == -1) {
				seenChildren.push(a.wristband[0]);
				return true;
			} else {
				return false;
			}
		});
	}

	searchThis() {
		let self = this;
		self.tickets = [];
		if (this.searchTerm.length < 3) {
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		self.error = '';
		self.loading = true;
		console.log('searching: ' + this.searchTerm);
		var wp = this.getWpApi('search');
		wp.handler().param('search', this.searchTerm).then((result) => {
			console.log(result);
			if (result.code === 200) {
				if (!isNaN(+self.searchTerm)) { //if the search term is a number
					result.tickets.sort(function (a, b) {
						if ((a.meta.wristband || [])[0] == self.searchTerm) {
							return -1;
						}
						return 1;
					}); //give priority to wristbands over hut numbers
				}
				self.tickets = result.tickets;
				if (self.tickets.length === 0) {
					self.error = 'Geen resultaten';
					self.errorHelp = 'Je kunt zoeken op hutnummer, polsbandje of voor- of achternaam.';
				}
				self.loading = false;
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

	showModal(child) {
		this.modal.child = child;
		this.modal.showModal = true;
		let t = child;
		let m = t.meta;
		this.history.unshift({
			name: m.WooCommerceEventsAttendeeName[0] + " " + m.WooCommerceEventsAttendeeLastName[0],
			wristband: m.wristband,
			hutnr: m.hutnr,
			wijk: this.getColor(m.hutnr)
		});
		this.filterHistory();
		this.storage.set("searchChildHistory", this.history);
		document.querySelector('#myModal').classList.add('high');
	}

	getColor(w) {
		let res = 'black';
		// console.log((w + "")[0])
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
				res = 'black';
		}
		return res;
	}

	closeModal() {
		this.modal.showModal = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}

	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
	}

	scanChild(barcode) {
		this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcode });
	}

	goHome() {
		if (this.modal.showModal) {
			let self = this;
			this.closeModal();
			setTimeout(function () {
				self.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
			}, 400);
		} else {
			this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
		}
	}
}
