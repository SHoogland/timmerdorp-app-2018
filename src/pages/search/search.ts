import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';

import { HomePage } from '../home/home';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { LoginPage } from '../login/login';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalFunctions } from '../../providers/global';

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

	staging: boolean;
	loading: boolean;

	searchTerm: string;
	errorHelp: string;
	title: string;
	error: string;

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
		public sanitizer: DomSanitizer,
		public g: GlobalFunctions
	) {
		this.title = 'Kinderen Zoeken'
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
		this.init();
	}

	init() {
		this.staging = false;

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

	ionViewDidLoad() {
		Promise.all([
			this.storage.get('searchChildHistory').then((val) => {
				this.history = val || [];
				console.log(this.history);
				this.history = this.g.filterHistory(this.history);
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
				this.staging = val;
			}, (error) => {
				this.staging = false;
			})
		]).then(() => {
			let self = this;
			setInterval(function () {
				self.error;
			}, 100);
		});
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
		var wp = this.g.getWpApi(this.login, this.staging, 'search');
		wp.handler().param('search', this.searchTerm).then((result) => {
			console.log(result);
			self.loading = false;
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
			} else {
				if (result.message == 'access denied') {
					self.error = 'Niet ingelogd';
					self.errorHelp = 'Je moet eerst <a (click)="g.toLogin()">inloggen</a>.';
				} else {
					self.error = result.message;
				}
			}
		}).catch((error) => {
			self.loading = false;
			if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
				self.error = 'Inloggegevens onjuist';
				self.errorHelp = 'Wijzig eerst je inloggegevens <a (click)="g.toLogin()">hier</a>.';
			} else {
				self.error = error.message;
			}
		});
	}

	showModal(child) {
		this.modal.child = child;
		this.modal.showModal = true;
		let t = child;
		let m = t.meta;
		this.history.unshift({
			firstName: m.WooCommerceEventsAttendeeName[0],
			surName: m.WooCommerceEventsAttendeeLastName[0],
			wristband: m.wristband,
			hutnr: m.hutnr,
			wijk: this.g.getColor(m.hutnr)
		});
		this.history = this.g.filterHistory(this.history);
		this.storage.set("searchChildHistory", this.history);
		document.querySelector('#myModal').classList.add('high');
	}

	closeModal() {
		this.modal.showModal = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
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
