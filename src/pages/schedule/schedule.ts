import { Component, ViewChild } from '@angular/core';
import { NavController, Content } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { GlobalFunctions } from '../../providers/global';
import { Storage } from '@ionic/storage';


@Component({
	selector: 'page-schedule',
	templateUrl: 'schedule.html'
})
export class SchedulePage {
	@ViewChild(Content) content: Content;
	loading: boolean;
	schedule: string;
	title: string;
	wijk: string;

	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient,
		public g: GlobalFunctions,
		public storage: Storage
	) {
	}

	init() {
		this.title = 'Programma';
		let self = this;
		this.storage.get("wijk").then(function (v) {
			self.wijk = v;
		});
		this.loading = true;
		this.httpClient.get("https://stannl.github.io/TimmerUpdatesAPI/TimmerUpdates.json")
			.subscribe((data: any) => {
				self.loading = false;
				self.schedule = data.schedule;
				setTimeout(function () {
					let id = self.getDate();
					let el = document.getElementById(id);
					if (el) {
						self.content.scrollTo(0, el.offsetTop - 12, 600);
					}
				}, 200);
			});
	}

	getDate() {
		return this.g.prependZero(new Date().getMonth() + 1) + "-" + this.g.prependZero(new Date().getDate()) + "-" + new Date().getFullYear();
	}

	getTime() {
		let pz = this.g.prependZero;
		let time = new Date();
		return pz(time.getHours()) + ":" + pz(time.getMinutes());
	}

	ionViewDidLoad() {
		this.init();
	}
}
