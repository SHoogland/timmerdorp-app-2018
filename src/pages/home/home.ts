import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import Parse from 'parse';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

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
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	modalShown: boolean;
	showPhoto: boolean;
	android: boolean;

	childrenCount: number;
	wijkCount: number;
	y: number;

	wijkChoice: string;
	version: string;
	error: string;
	wijk: string;

	updates: any;
	wijken: any;
	pages: any;

	clickedTwice = false;
	clickedOnce = false;

	readablePageList: any;
	openedPage: any;

	weather: any;


	constructor(
		private barcodeScanner: BarcodeScanner,
		public navCtrl: NavController,
		public platform: Platform,
		public storage: Storage,
		public httpClient: HttpClient,
		private iab: InAppBrowser,
		private g: GlobalFunctions
	) {
		this.y = new Date().getFullYear();
		if (this.platform.is('cordova')) {
			if (cordova.platformId === 'android') {
				this.platform.registerBackButtonAction(() => {
					if (this.modalShown) {
						this.modalShown = false;
					} else {
						return;
					}
				});
			}
		}
	}

	async init() {
		this.showPhoto = false;
		this.updates = [];
		this.readablePageList = {
			"scan-ticket": "ticketscanner",
			"weather": "weather",
			"children": WijkPage,
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
		this.g.setStatusBar("#2196f3");

		this.childrenCount = 0;

		this.modalShown = false;

		if (this.platform.is("android")) this.android = true;

		let self = this;
		if (self.platform.is("cordova")) {
			cordova.getAppVersion(function (version) {
				self.version = version;
			});
		}

		this.storage.get('wijk').then((val) => {
			this.wijk = val || "blue";
			this.wijken = {
				blue: "blauw",
				red: "rood",
				green: "groen",
				yellow: "geel"
			}

			// var wp = this.g.getWpApi(this.login, this.staging, 'stats');
			// wp.handler().then((result) => {
			// 	console.log(result);
			// 	if (result.code === 200) {
			// 		let prop = 'present' + ['Tue', 'Wed', 'Thu', 'Fri'][new Date().getDay() - 2];
			// 		this.wijkCount = result.quarters[this.wijk][prop] || 0;
			// 		this.childrenCount = result[prop] || 0;
			// 	}
			// });

			console.log(this.wijk);

			this.pages = [
				{
					title: '-',
					component: "weather",
					class: 'bg-white halfWidth homeInfoCard weather',
					icon: "partly-sunny",
					weather: true
				},
				{
					title: '-',
					component: "children",
					class: 'bg-white halfWidth homeInfoCard weather',
					icon: "calculator",
					data: true
				},
				{
					title: 'Zoek kinderen',
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
					title: 'Beheer hutjes',
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
					title: 'Wijkoverzicht ' + this.g.getWijkName(this.wijk),
					component: "wijk",
					class: 'small bg-' + (this.wijk || 'blue'),
					icon: "analytics",
					small: true
				},
				{
					title: 'Programma',
					component: "schedule",
					class: 'bg-blue small',
					icon: "calendar",
					small: true
				},
				{
					title: 'Foto\'s en Bijlagen',
					component: "files",
					class: 'bg-blue small',
					icon: "images",
					small: true
				},
				{
					title: 'App info',
					component: "app-info",
					class: 'bg-blue small',
					icon: "settings",
					small: true
				},
				{
					title: 'Log uit',
					component: "login",
					class: 'bg-red small',
					icon: "md-log-out",
					small: true
				}
			];
		});


		this.httpClient.get("https://api.openweathermap.org/data/2.5/forecast?q=Heiloo,NL&APPID=e98a229cdc17ffdc226168c33aefa0c1").subscribe((data: any) => {
			let weatherMessage = "Geen regen voorspeld!";
			let totalRain = 0;
			let skipped = 0;
			let weatherIcon = "sunny";
			for (let i = 0; i < 2 + skipped; i++) {
				let w = data.list[i]; //weather data for a three-hour period
				let td = 1000 * w.dt - +new Date(); //time diff between now and w
				if (td < 30 * 60 * 1000) {
					skipped++;
					continue;
				}
				if (!w.rain) continue;
				totalRain += w.rain["3h"] || w.rain[Object.keys(w.rain)[0]];
			}

			let rainPerHour = totalRain / 6;
			console.log(totalRain, rainPerHour);
			if (rainPerHour > 0) {
				if (rainPerHour > .5) {
					weatherMessage = "Veel regen voorspeld";
				} else {
					weatherMessage = "Lichte buien voorspeld";
				}
				weatherIcon = "rainy";
			}

			this.weather = {
				temp: (Math.round((data.list[0].main.temp - 273.15) * 10) / 10).toFixed(1),
				msg: weatherMessage,
				icon: weatherIcon
			}

			console.log(data, this.weather);
		});

    if(!await this.g.checkIfStillLoggedIn()) {
      this.g.toLogin()
    }
	}

	ionViewDidLoad() {
		this.init();
		let self = this;
		this.httpClient.get("https://stannl.github.io/TimmerUpdatesAPI/TimmerUpdates.json").subscribe((data: any) => {
			self.updates = data.updates;
			self.updates.sort(function (a, b) {
				return b.date - a.date;
			});
		});
	}

	openStore() {
		if (this.platform.is("android")) {
			window.location.href = 'https://play.google.com/store/apps/details?id=nl.matise.tdorpscanner';
		}
		if (this.platform.is('ios')) {
			window.location.href = 'https://testflight.apple.com/join/0zJLQ88Q';
		}
	}

	async openPage(page) {
		this.openedPage = page;
		console.log(this.openedPage.component);

		let blockOpening = false;
		if (this.platform.is("cordova")) {
			for (let i = 0; i < this.updates.length; i++) {
				if (this.compareVersions(this.updates[i].version, this.version)) {
					console.log("found newer update: ")
					console.log(this.updates[i]);
					if (this.updates[i].editedPages.indexOf(this.openedPage.component) > -1) {
						blockOpening = true;
					}
				}
			}
		}


		if (!blockOpening) {
      let ogPage = this.openedPage.component
			this.openedPage.component = this.readablePageList[this.openedPage.component];
			if (this.openedPage.component === 'ticketscanner') {
				this.scanCode();
			} else if (this.openedPage.component === 'weather') {
				this.iab.create("https://buienradar.nl/weer/heiloo/nl/2754516", "_system");
			} else if (ogPage === 'login') {
        await Parse.User.logOut();
				this.navCtrl.setRoot(this.openedPage.component, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
      } else {
        console.log('ahnee')
				this.navCtrl.setRoot(this.openedPage.component, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
			}
		} else {
			this.showModal();
		}
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
			this.navCtrl.setRoot(this.openedPage.component, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
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
			this.barcodeScanner.scan({
				resultDisplayDuration: 0,
				showTorchButton: true,
				prompt: "Scan barcode vanaf een papieren of digitaal ticket."
			}).then((barcodeData) => {
				this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcodeData.text });
			}, (error) => {
				console.log(error);
				this.error = error.message;
			});
		} else {
			this.navCtrl.setRoot(ScanTicketPage, { 'barcode': 420 });
		}
	}
}
