import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, Keyboard } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
	selector: 'page-presence',
	templateUrl: 'presence.html'
})
export class PresencePage {
	errorHelp: string;
	number: string;
	title: string;
	error: string;
	name: string;
	day: string;

	modalShown: boolean;
	greenBtn: boolean;
	loading: boolean;
	staging: boolean;

	login: {
		username: string,
		password: string
	};

	tickets: Array<any>;
	history: any;

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public storage: Storage,
		public cd: ChangeDetectorRef,
		public keyboard: Keyboard,
		public g: GlobalFunctions
	) {
		this.title = 'Aanwezigheid';
		if (this.platform.is('cordova')) {
			if (cordova.platformId === 'android') {
				this.platform.registerBackButtonAction(() => {
					if (this.modalShown) {
						this.modalShown = false;
					} else {
						this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
					}
				});
			}
		}
	}

	init() {
		switch (new Date().getDay()) {
			case 2:
				this.day = "tue";
				break;
			case 3:
				this.day = 'wed';
				break;
			case 4:
				this.day = 'thu';
				break;
			case 5:
				this.day = 'fri';
				break;
			default:
				this.day = 'tue'
				alert("Nog even wachten tot Timmerdorp!");
				this.g.goHome();
		}
		this.modalShown = false;
		this.greenBtn = false;
		this.staging = false;

		this.login = {
			username: '',
			password: ''
		}
		this.loading = false;
		this.error = '';
		this.tickets = [];

		this.number = '';
		this.name = '';

		Promise.all([
			this.storage.get('presHistory').then((val) => {
				this.history = val || [];
				this.history = this.g.filterHistory(this.history);
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
				this.staging = val;
			}, (error) => {
				this.staging = false;
			})
		]).then(() => {
		});
	}

	getDayName(d) {
		if (d == 'tue') return "Dinsdag"
		if (d == 'wed') return "Woensdag"
		if (d == 'thu') return "Donderdag"
		if (d == 'fri') return "Vrijdag"
	}

	ionViewDidLoad() {
		this.init();
	}

	hideKeyboard() {
		this.keyboard.close();
	}

	getChild() {
		this.error = '';
		let self = this;
		if (this.number.length === 3) {
			this.loading = true;
			// var wp = this.g.getWpApi(this.login, this.staging, 'search');
			// wp.handler().param('search', this.number).param('withouthut', '').then((result) => {
			// 	console.log(result);
			// 	if (result.code === 200) {
			// 		self.error = '';
			// 		if (result.tickets.length === 0) {
			// 			self.error = 'Geen resultaten';
			// 			self.errorHelp = 'Tip: Je kunt alleen zoeken op polsbandnummer.';
			// 			self.loading = false;
			// 			return;
			// 		}
			// 		result.tickets = result.tickets.filter(function (a) {
			// 			if ((a.meta.wristband || [])[0] !== self.number) {
			// 				return false;
			// 			}
			// 			return true;
			// 		});
			// 		if (result.tickets.length === 0) {
			// 			self.error = 'Geen resultaten';
			// 			self.errorHelp = 'Tip: Je kunt alleen zoeken op polsbandnummer.';
			// 			self.loading = false;
			// 			return;
			// 		}
			// 		let t = result.tickets[0];
			// 		let m = t.meta;
			// 		self.history.unshift({
			// 			firstName: m.WooCommerceEventsAttendeeName[0],
			// 			lastName: m.WooCommerceEventsAttendeeLastName[0],
			// 			wristband: m.wristband,
			// 			hutnr: m.hutnr,
			// 			wijk: self.g.getColor(m.hutnr)
			// 		});
			// 		self.history = this.g.filterHistory(this.history);
			// 		self.storage.set("presHistory", self.history);
			// 		console.log(result.tickets);
			// 		self.tickets = result.tickets;
			// 		self.loading = false;
			// 	} else {
			// 		if (result.message == 'access denied') {
			// 			this.error = 'Niet ingelogd';
			// 			this.errorHelp = 'Je moet eerst <a (click)="g.toLogin()">inloggen</a>.';
			// 		} else {
			// 			self.error = result.message;
			// 			self.loading = false;
			// 		}
			// 	}
			// }).catch((error) => {
			// 	if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
			// 		this.error = 'Inloggegevens onjuist';
			// 		this.errorHelp = 'Wijzig eerst je inloggegevens <a (click)="g.toLogin()">hier</a>.';
			// 	} else {
			// 		self.error = error.message;
			// 	}
			// 	self.loading = false;
			// });
		} else {
			this.loading = false;
			this.tickets = [];
		}
	}

	makeAbsent() {
		this.closeModal();
		if (this.number.length < 3) return;
		if (!this.tickets[0]) {
			this.error = 'Geen kind gevonden!';
			return;
		}

		let self = this;
		// var wp = this.g.getWpApi(this.login, this.staging, 'presence');
		// wp.handler().param('wristband', this.number).param('day', this.day).param('presence', false).then((result) => {
		// 	if (result.code === 200) {
		// 		this.markDone();
		// 		console.log("Child absence update successful for " + self.day, result)
		// 		this.loading = false;
		// 		this.error = '';
		// 		self.loading = false;
		// 	} else {
		// 		self.error = result.message;
		// 		self.loading = false;
		// 	}
		// }).catch((error) => {
		// 	self.loading = false;
		// 	console.log(error);
		// });
	}

	togglePresence() {
		this.hideKeyboard();
		if (this.number.length < 3) return;
		if (!this.tickets[0]) {
			this.error = 'Geen kind gevonden!';
			return;
		}
		let self = this;
		self.loading = true;
		if (this.tickets[0].meta['present_' + this.day] + '' == 'undefined') {
			this.tickets[0].meta['present_' + this.day] = [false]
		}
		var pres = !(this.tickets[0].meta['present_' + this.day] || [])[0];
		console.log(pres);
		if (!pres) {
			console.log("warning user that child is already present");
			this.showModal();
			return;
		}
		// var wp = this.g.getWpApi(this.login, this.staging, 'presence');
		// wp.handler().param('wristband', this.number).param('day', this.day).param('presence', pres).then((result) => {
		// 	if (result.code === 200) {
		// 		this.markDone();
		// 		console.log("Child presence update successful for " + self.day, result)
		// 		this.loading = false;
		// 		this.error = '';
		// 		self.loading = false;
		// 	} else {
		// 		self.error = result.message;
		// 		self.loading = false;
		// 	}
		// }).catch((error) => {
		// 	self.loading = false;
		// 	console.log(error);
		// });
	}

	showModal() {
		this.modalShown = true;
		document.querySelector('#myModal').classList.add('high');
	}

	closeModal() {
		this.loading = false;
		this.modalShown = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}


	markDone() {
		this.tickets = [];
		this.greenBtn = true;
		let self = this;
		document.getElementById("btnLabel").innerHTML = "Opgeslagen!";
		(<HTMLScriptElement>document.querySelector("#numberInput input")).focus();
		self.number = '';
		setTimeout(function () {
			self.greenBtn = false;
			(<HTMLScriptElement>document.querySelector("#numberInput input")).focus();
			document.getElementById("btnLabel").innerHTML = "Opslaan";
			self.cd.detectChanges();
		}, 1000);
	}

	alert() {
		alert("Om fouten te voorkomen is het niet mogelijk aanwezigheid te veranderen voor andere dagen. Vragen, of alsnog een wijziging aanvragen? Zoek Stan uit wijk blauw/Stephan uit wijk geel");
	}

	showCard() {
		return Boolean(((this.tickets || [])[0] || {}).meta);
	}
}
