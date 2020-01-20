import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
	selector: 'page-app-info',
	templateUrl: 'app-info.html'
})
export class AppInfoPage {
	staging: boolean;

	version: string;
	error: string;
	wijk: string;

	updates: any;

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public storage: Storage,
		public httpClient: HttpClient,
		public g: GlobalFunctions
	) {
	}

	init() {
		this.staging = false;

		this.storage.get('wijk').then((val) => {
			this.wijk = val;
		});
		if (this.platform.is("cordova")) {
			let self = this;
			cordova.getAppVersion(function (version) {
				self.version = version;
			});
		} else {
			this.version = 'Desktop';
		}

		let self = this;

		this.httpClient.get("https://stannl.github.io/TimmerUpdatesAPI/TimmerUpdates.json")
			.subscribe((data: any) => {
				let u = data.updates;
				u.sort(function (a, b) {
					return b.date - a.date;
				});
				u[0].latest = true;
				self.updates = u;
			});
	}

	datum(date) {
		let d = new Date(date);
		let d2 = new Date(date);
		d2.setHours(0);
		d2.setMinutes(0);
		d2.setSeconds(0);
		d2.setMilliseconds(0);
		let today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		today.setMilliseconds(0);

		if (+d2 === +today) {
			return "Vandaag " + this.tijdstip(d);
		} else if (+today - +d2 == 24 * 60 * 60 * 1000) {
			return "Gisteren " + this.tijdstip(d);
		}
		return this.prependZero(d.getDate()) + "-" + this.prependZero(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + this.tijdstip(d);
	}

	tijdstip(t) {
		return "om " + this.prependZero(t.getHours()) + ":" + this.prependZero(t.getMinutes());
	}

	belStan() {
		window.location.href = 'tel:0640516654'
	}

	prependZero(n) {
		if (n < 10 && n > -10) {
			return '0' + n;
		} else {
			return '' + n;
		}
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

	ionViewDidLoad() {
		this.storage.get('staging').then((val) => {
			this.staging = val;
		}, (error) => {
			this.staging = false;
		});
		this.init();
	}
}