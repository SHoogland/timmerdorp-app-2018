import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';

import { HomePage } from '../home/home';


@Component({
	selector: 'files',
	templateUrl: 'files.html'
})
export class FilesPage {
	schedule: string;
	albums: any;
	files: any;
	photoyear: Number;
	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient,
	) {
	}

	init() {
		this.photoyear = 2019;
		let self = this;

		this.httpClient
			.get("https://api.flickr.com/services/rest?method=flickr.photosets.getList&user_id=53061083@N07&api_key=a658fee478c0fa8a0744191ca017bfd0&format=json&nojsoncallback=1&primary_photo_extras=url_m")
			.subscribe((data: any) => {
				self.albums = data.photosets.photoset;
				self.albums = self.albums.filter(function (a) {
					if (a.title['_content'].split(self.photoyear).length > 1) return true;
					return false;
				});
			});

		this.httpClient
			.get("https://stannl.github.io/TimmerUpdatesAPI/TimmerUpdates.json")
			.subscribe((data: any) => {
				console.log(data);
				self.files = data.files||[];
			});
	}

	openAlbum(id) {
		window.location.href = "https://www.flickr.com/photos/timmerdorpheiloo/albums/" + id;
	}

	openFile(url){
		window.location.href = url;
	}

	ionViewDidLoad() {
		this.init();
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: 'back' });
	}
}