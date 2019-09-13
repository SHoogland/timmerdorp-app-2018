import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

declare let cordova: any;

@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	@ViewChild(Nav) nav: Nav;

	rootPage: any = HomePage;
	pages: Array<{ title: string, component: any }>;
	endpoint: string;

	login: {
		username: string,
		password: string
	};

	constructor(
		public platform: Platform,
		public statusBar: StatusBar,
		public splashScreen: SplashScreen,
		public storage: Storage
	) {
		if (this.platform.is('cordova')) {
			if (cordova.platformId === 'android') {
				this.statusBar.backgroundColorByHexString("#045c9f");
			} else if (cordova.platformId === 'ios') {
				this.statusBar.backgroundColorByHexString("#0572c8");
			}
		}
		this.initializeApp();
	}

	initializeApp() {
		this.login = {
			username: '',
			password: ''
		}
		this.endpoint = 'https://shop.timmerdorp.com/wp-json';

		this.platform.ready().then(() => {
			Promise.all([
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
					if (val) {
						this.endpoint = 'https://staging.timmerdorp.com/wp-json';
					} else {
						this.endpoint = 'https://shop.timmerdorp.com/wp-json';
					}
				}, (error) => {
					this.endpoint = 'https://shop.timmerdorp.com/wp-json';
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
		if (!this.login.username || !this.login.password) {
			this.toLogin();
		} else {
			console.log("Determining whether login is correct by searching for random child '000'...")
			var wp = this.getWpApi('search');
			wp.handler().param('search', "000").then((result) => {
				if (result.code === 200) {
					console.log("Logingegevens kloppen!");
				} else if (result.message === 'access denied') { // user probably didn't fill in username & password at all.
					this.toLogin();
				} else {
					console.log(result);
				}
			}).catch((error) => {
				if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
					this.toLogin();
				} else {
					this.toLogin();
					console.log(error);//user is offline (probably)
				}
			});
		}
	}

	getWpApi(route) {
		var wp = new WPAPI({
			endpoint: this.endpoint,
			username: this.login.username,
			password: this.login.password
		});

		wp.handler = wp.registerRoute('tickets', route, {});

		return wp;
	}

	toLogin() {
		this.nav.setRoot(LoginPage, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
	}

	openPage(page) {
		this.nav.setRoot(page.component, { animate: true, animation: "ios-transition", direction: 'forward' });
	}
}
