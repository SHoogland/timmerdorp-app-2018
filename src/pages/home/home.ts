import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { WijkPage } from '../wijk/wijk';
import { SearchPage } from '../search/search';
import { ConnectChildToCabinPage } from '../connect-child-to-cabin/connect-child-to-cabin';
import { Storage } from '@ionic/storage';
import { PresencePage } from '../presence/presence';
import { LoginPage } from '../login/login';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { AppInfoPage } from '../app-info/app-info';
import { HttpClient } from '@angular/common/http';
import { SchedulePage } from '../schedule/schedule';
import { ChangeWristbandPage } from '../change-wristband/change-wristband';
import { FilesPage } from '../files/files';

declare let cordova: any;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	error: string;
	pages: Array<{
		title: string,
		component: any,
		class: string,
		icon: string
	}>;
	modalShown: boolean;
	login: {
		username: '',
		password: ''
	};
	clickedOnce = false;
	clickedTwice = false;
	staging = false;
	wijk: string;
	openedPage: any;
	android: Boolean;
	version: string;
	readablePageList: any;

	constructor(
		public navCtrl: NavController,
		private barcodeScanner: BarcodeScanner,
		public platform: Platform,
		public storage: Storage,
		public httpClient: HttpClient
	) {
	}

	init() {
		this.readablePageList = {
			"scan-ticket": "ticketscanner",
			"connect-child-to-cabin": ConnectChildToCabinPage,
			"search": SearchPage,
			"presence": PresencePage,
			"wijk": WijkPage,
			"app-info": AppInfoPage,
			"login": LoginPage,
			"schedule": SchedulePage,
			"change-wristband": ChangeWristbandPage,
			"files": FilesPage
		}
		
		this.modalShown = false;

		if (this.platform.is("android")) this.android = true;

		let self = this;
		if (self.platform.is("cordova")) {
			cordova.getAppVersion(function (version) {
				self.version = version;
			});
		}

		this.storage.get('wijk').then((val) => {
			this.wijk = val;

			this.pages = [
				{
					title: 'Zoek kind',
					component: "search",
					class: 'bg-blue',
					icon: "search"
				},
				{
					title: 'Aanwezigheid',
					component: "presence",
					class: 'bg-blue',
					icon: "checkmark-circle-outline"
				},
				{
					title: 'Scan ticket',
					component: "scan-ticket",
					class: 'bg-blue',
					icon: 'qr-scanner'
				},
				{
					title: 'Koppel kind aan hut',
					component: "connect-child-to-cabin",
					class: 'bg-blue',
					icon: 'person-add'
				},
				{
					title: 'Verander polsbandje',
					component: "change-wristband",
					class: 'bg-blue',
					icon: 'create'
				},
				{
					title: 'Wijkoverzicht ' + this.getWijkName(this.wijk),
					component: "wijk",
					class: 'bg-' + (this.wijk || 'blue'),
					icon: "analytics"
				},
				{
					title: 'Programma',
					component: "schedule",
					class: 'bg-blue',
					icon: "list"
				},
				{
					title: 'Foto\'s en Bijlagen',
					component: "files",
					class: 'bg-blue',
					icon: "images"
				},
				{
					title: 'App info',
					component: "app-info",
					class: 'bg-blue',
					icon: "information-circle"
				},
				{
					title: 'Log uit',
					component: "login",
					class: 'bg-darkred',
					icon: "log-out"
				}
			];
		});
	}


	getWijkName(kleur) {
		if (kleur == 'blue') return 'Blauw';
		if (kleur == 'yellow') return 'Geel';
		if (kleur == 'red') return 'Rood';
		if (kleur == 'green') return 'Groen';
		return '';
	}

	ionViewDidLoad() {
		this.init();
		this.storage.get('staging').then((val) => {
			this.staging = val;
		}, (error) => {
			this.staging = false;
		})
	}

	openStore(){
		if(this.platform.is("android")){
			window.location.href = 'https://play.google.com/store/apps/details?id=nl.matise.tdorpscanner';
		}
		if(this.platform.is('ios')){
			window.location.href = 'https://testflight.apple.com/join/0zJLQ88Q';
		}
	}

	openPage(page) {
		this.openedPage = page;
		this.httpClient.get("https://stannl.github.io/TimmerUpdatesAPI/TimmerUpdates.json")
			.subscribe((data: any) => {
				let u = data.updates;
				u.sort(function (a, b) {
					return b.date - a.date;
				});

				console.log(this.openedPage.component);

				let blockOpening = false;
				if (this.platform.is("cordova")) {
					for (let i = 0; i < u.length; i++) {
						if (this.compareVersions(u[i].version, this.version)) {
							console.log("found newer update: ")
							console.log(u[i]);
							if (u[i].editedPages.indexOf(this.openedPage.component) > -1) {
								blockOpening = true;
							}
						}
					}
				}


				if (!blockOpening) {
					this.openedPage.component = this.readablePageList[this.openedPage.component];
					if (this.openedPage.component == 'ticketscanner') {
						this.scanCode();
					} else {
						this.navCtrl.setRoot(this.openedPage.component, {}, { animate: true, direction: 'forward' });
					}
				} else {
					this.showModal();
				}
			});
	}

	showModal() {
		this.modalShown = true;
		document.querySelector('#myModal').classList.add('high');
	}

	closeModal() {
		this.modalShown = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}

	forceOpenPage() {
		this.openedPage.component = this.readablePageList[this.openedPage.component];
		if (this.openedPage.component == 'ticketscanner') {
			this.scanCode();
		} else {
			this.navCtrl.setRoot(this.openedPage.component, {}, { animate: true, direction: 'forward' });
		}
	}

	belStan() {
		window.location.href = 'tel:0640516654'
	}

	compareVersions(New, Old) {
		for (let i = 0; i < New.split(".").length; i++) {
			if ((+New.split(".")[i] || -1) > (+Old.split(".")[i] || -1)) {
				return true;
			} else if ((+New.split(".")[i] || -1) == (+Old.split(".")[i] || -1)) {
				continue;
			}
			return false;
		}
		return false;
	}

	scanCode() {
		if (this.platform.is('cordova')) {
			this.barcodeScanner.scan().then((barcodeData) => {
				this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcodeData.text });
			}, (error) => {
				console.log(error);
				this.error = error.message;
			});
		} else {
			this.navCtrl.setRoot(ScanTicketPage, { 'barcode': 420 });
		}
	}

	switchEnv() {
		const _this = this;
		setTimeout(function () {
			_this.clickedOnce = false;
			_this.clickedTwice = false;
		}, 1000)
		if (this.clickedTwice) {
			if (!this.staging) {
				this.storage.set('staging', true);
				this.staging = true;
			} else {
				this.storage.set('staging', false);
				this.staging = false;
			}
			this.clickedOnce = false;
			this.clickedTwice = false;
		}
		if (this.clickedOnce) {
			this.clickedTwice = true;
		}
		this.clickedOnce = true;
	}

	goHome() {
		return;
	}
}
