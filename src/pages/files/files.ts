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
	loading: boolean;
	files: any;
	photoYear: Number;
	allAlbums: any;
	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient,
	) {
		this.loading = false;
	}

	init() {
		this.photoYear = 2019;
		let self = this;
		this.loading = true;
		this.httpClient
			.get("https://api.flickr.com/services/rest?method=flickr.photosets.getList&user_id=53061083@N07&api_key=a658fee478c0fa8a0744191ca017bfd0&format=json&nojsoncallback=1&primary_photo_extras=url_m")
			.subscribe((data: any) => {
				self.loading = false;
				self.allAlbums = data.photosets.photoset;
				self.filterAlbums();
			});

		this.httpClient
			.get("https://stannl.github.io/TimmerUpdatesAPI/TimmerUpdates.json")
			.subscribe((data: any) => {
				console.log(data);
				self.files = data.files||[];
			});
	}

	filterAlbums(){
		if(this.photoYear < 2000 ) {
			this.albums = [];
			return;
		}
		let self = this;
		this.albums = this.allAlbums.filter(function (a) {
			if (a.title['_content'].split(self.photoYear).length > 1) return true;
			return false;
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