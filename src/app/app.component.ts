import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';

declare let cordova: any;

@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	@ViewChild(Nav) nav: Nav;

	rootPage: any = HomePage;
	pages: Array<{ title: string, component: any }>;

	constructor(
		public platform: Platform,
		public statusBar: StatusBar,
		public splashScreen: SplashScreen,
	) {
		this.initializeApp();
	}

	initializeApp() {
		this.platform.ready().then(() => {
			// Okay, so the platform is ready and our plugins are available.
			// Here you can do any higher level native things you might need.

			this.splashScreen.hide();
			if (cordova.platformId === 'android') {
				this.platform.registerBackButtonAction(() => { 
					console.log("TERUG KNOP ANDROID");
					this.nav.setRoot(HomePage);
				});
				this.statusBar.backgroundColorByHexString("#0094f0");
			} else if(cordova.platformId === 'ios'){
				this.statusBar.backgroundColorByHexString("#30b0ff");
			}
		});
	}

	openPage(page) {
		this.nav.setRoot(page.component);
	}
}
