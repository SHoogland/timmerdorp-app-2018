import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Storage } from '@ionic/storage';

import { HomePage } from '../pages/home/home';
import { GlobalFunctions } from '../providers/global';

declare let cordova: any;

@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	@ViewChild(Nav) nav: Nav;

	rootPage: any = HomePage;
	pages: Array<{ title: string, component: any }>;

	constructor(
		private g: GlobalFunctions,
		public platform: Platform,
		public splashScreen: SplashScreen,
		public storage: Storage
	) {
		this.g.setStatusBar("#0572c8");
		this.initializeApp();
	}


	async initializeApp() {
		this.platform.ready().then(() => {
			let isSentToLogin = false;
			Promise.all([
				this.storage.get("notFirstUse").then((val) => {
					if (!val) {
						isSentToLogin = true;
						this.g.toLogin();
					}
				}, (error) => {
					isSentToLogin = true;
					this.g.toLogin();
				}),
			]).then(() => {
				if (this.platform.is('cordova')) {
					if (cordova.platformId === 'android') {
						let self = this;
						document.addEventListener("backbutton", () => {
							console.log("TERUG KNOP ANDROID", this);
							let preventBack = ['page-search', 'page-connect-child-to-cabin', 'page-home', 'page-presence', 'page-scan-ticket']
							if (preventBack.indexOf(this.nav.getActive().pageRef().nativeElement.tagName.toLowerCase()) > -1) {
								console.log("close the modal, if opened");
							} else {
                this.g.goHome();
							}
						});
					}
				}
				if (!isSentToLogin) {
					this.g.checkIfStillLoggedIn().then((loggedIn) => {
            if(!loggedIn) this.g.toLogin();
          }).catch((e) => console.log(e));
				}
			});
		});
	}
}
