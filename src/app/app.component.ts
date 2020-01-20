import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
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
	staging: boolean;

	login: {
		username: string,
		password: string
	};

	constructor(
		private g: GlobalFunctions,
		public platform: Platform,
		public splashScreen: SplashScreen,
		public storage: Storage
	) {
		this.g.setStatusBar("#0572c8");
		this.initializeApp();
	}


	initializeApp() {
		this.login = {
			username: "",
			password: ""
		}

		this.platform.ready().then(() => {
			Promise.all([
				this.storage.get("notFirstUse").then((val) => {
					if (!val) {
						this.g.toLogin();
					}
				}, (error) => {
					this.g.toLogin();
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
					this.staging = !!val;
				}, (error) => {
					this.staging = false;
				})
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
								self.nav.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
							}
						});
					}
				}

				this.preCheckLogin();
			});
		});
	}


	preCheckLogin() {
		console.log("Determining whether login is correct by searching for random child '000'...")
		var wp = this.g.getWpApi(this.login, this.staging, 'search');
		wp.handler().param('search', "000").then((result) => {
			if (result.code === 200) {
				console.log("Logingegevens kloppen!");
			} else if (result.message === 'access denied') { // user probably didn't fill in username & password at all.
				this.g.toLogin();
			} else {
				console.log(result);
			}
		}).catch((error) => {
			if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
				this.g.toLogin();
			} else {
				this.g.toLogin();
				console.log(error);//user is offline (probably)
			}
		});
	}
}