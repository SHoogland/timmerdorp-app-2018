import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
	selector: 'page-search',
	templateUrl: 'search.html',
})
export class SearchPage {
	tableCategories: any;
	ticketPropertiesMap: any;
	typingTimer: any;
	timeOut: any;
	tickets: any;
	history: any;

	loading: boolean;

	searchTerm: string;
	errorHelp: string;
	title: string;
	error: string;

	modal: {
		showModal: boolean;
		child: any;
	}

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
		this.modal = {
			child: null,
			showModal: false
		}

		this.timeOut = setTimeout;

		this.loading = false;

		this.error = '';
		this.errorHelp = '';

    this.ticketPropertiesMap = [];

		this.tableCategories = [
			{
				name: "Gegevens huisarts",
				props: ["naam_huisarts", "tel_huisarts"]
			},
			{
				name: "Contactgegevens ouders",
				props: ["tel1", "tel2"]
      },
			{
				name: "Gegevens Kind",
				props: ["nickName", "birthdate", "wristband", "hutnr", "opmerkingen"]
      },
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
			}, 100);
		} catch (e) {
			console.log(e);
		}
	}

	filterPhoneNr(num) {
		return (num || [""])[0].replace(/[^0-9+]/g, '');
	}


	async searchThis() {
		let self = this;
		self.tickets = [];
		self.error = '';
		self.errorHelp = '';
		if (this.searchTerm.length < 3) {
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		self.loading = true;

		console.log('searching: ' + this.searchTerm);
    let result = await this.g.apiCall('search', { searchTerm: this.searchTerm }).catch((e) => {
      self.error = String(e)
    })
    self.loading = false
    self.tickets = result.tickets
    self.ticketPropertiesMap = result.ticketPropertiesMap


		// var wp = this.g.getWpApi(this.login, this.staging, 'search');
		// wp.handler().param('search', this.searchTerm).then((result) => {
		// 	console.log(result);
		// 	self.loading = false;
		// 	if (result.code === 200) {
		// 		if (!isNaN(+self.searchTerm)) { //if the search term is a number
		// 			result.tickets.sort(function (a, b) {
		// 				if ((a.meta.wristband || [])[0] == self.searchTerm) {
		// 					return -1;
		// 				}
		// 				return 1;
		// 			}); //give priority to wristbands over hut numbers
		// 		}
		// 		self.tickets = result.tickets;
		// 		if (self.tickets.length === 0) {
		// 			self.error = 'Geen resultaten';
		// 			self.errorHelp = 'Je kunt zoeken op hutnummer, polsbandje of voor- of achternaam.';
		// 		}
		// 	} else {
		// 		if (result.message == 'access denied') {
		// 			self.error = 'Niet ingelogd';
		// 			self.errorHelp = 'Je moet eerst <a (click)="g.toLogin()">inloggen</a>.';
		// 		} else {
		// 			self.error = result.message;
		// 		}
		// 	}
		// }).catch((error) => {
		// 	self.loading = false;
		// 	if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
		// 		self.error = 'Inloggegevens onjuist';
		// 		self.errorHelp = 'Wijzig eerst je inloggegevens <a (click)="g.toLogin()">hier</a>.';
		// 	} else {
		// 		self.error = error.message;
		// 	}
		// });
	}

	showModal(child) {
		this.modal.child = child;
		this.modal.showModal = true;
		this.history.unshift({
			firstName: child.firstName,
			lastName: child.lastName,
			wristband: child.wristband,
			hutnr: child.hutnr,
			wijk: this.g.getColor(child.hutnr)
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
