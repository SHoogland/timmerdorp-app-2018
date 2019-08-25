import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';

declare let cordova: any;

@Component({
	selector: 'page-schedule',
	templateUrl: 'schedule.html'
})
export class SchedulePage {
	schedule: string;
	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient
	) {
	}

	init() {
		let self = this;

		this.httpClient.get("https://stannl.github.io/TimmerUpdatesAPI/TimmerUpdates.json")
			.subscribe((data: any) => {
				self.schedule = data.schedule;
			});
	}

	ionViewDidLoad() {
		this.init();
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: 'back' });
	}
}