import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';

@Component({
	selector: 'page-presence',
	templateUrl: 'presence.html'
})
export class PresencePage {
	error: string;
	endpoint: string;
	loading: boolean;
	day: string;
	loginError: boolean;
	notLoggedIn: boolean;
	login: {
		username: string,
		password: string
	};
	tickets: Array<any>;

	number: string;
	name: string;

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public storage: Storage,
		private cd: ChangeDetectorRef
	) {
		this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		this.init();
	}

	init() {
		this.day = new Date().getDay() == 4 ? "thu" : "wed";
		//^ If today is Thursday, this.day=thu. Else, show the next upcoming day, which defaults to Wednesday


		this.loginError = false;
		this.notLoggedIn = false;

		this.login = {
			username: '',
			password: ''
		}
		this.loading = false;
		this.error = '';
		this.tickets = [];

		this.number = '';
		this.name = '';
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

	ionViewDidLoad() {
		// let self = this;

		this.init();

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
				if(val){
					this.endpoint = 'https://staging.timmerdorp.com/wp-json';
				} else{
					this.endpoint = 'https://shop.timmerdorp.com/wp-json';
				}
			}, (error) => {
				this.endpoint = 'https://shop.timmerdorp.com/wp-json';
			})
		]).then(() => {
		});
	}

	getChild() {
		let self = this;
		if (this.number.length === 3) {
			this.loading = true;
			var wp = this.getWpApi('search');
			wp.handler().param('search', this.number).param('withouthut', '').then((result) => {
				console.log(result);
				if (result.code === 200) {
					self.error = '';
					self.tickets = result.tickets;
					if (self.tickets.length === 0) {
						self.error = 'Geen resultaten';
					}
					self.loading = false;
				} else {
					if (result.message == 'access denied') {
						this.notLoggedIn = true;
					} else {
						self.error = result.message;
						self.loading = false;
					}
				}
			}).catch((error) => {
				if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
					this.loginError = true;
				} else {
					self.error = error.message;
				}
				self.loading = false;
			});
		}
	}

	togglePresence(child, day) {
		let self = this;
		self.loading = true;
		var wp = this.getWpApi('presence');
		wp.handler().param('wristband', child.meta.wristband).param('day', day).param('presence', !!(child.meta['present_'+ day]||[])[0]).then((result) => {
			if (result.code === 200) {
				console.log("Child presence update successful", result)
				this.loading = false;
				this.error = '';
				self.loading = false;
			} else {
				self.error = result.message;
				self.loading = false;
			}
		}).catch((error) => {
			console.log(error);
		});
	}


	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, {animate: true, direction: 'forward'});
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: "back"});
	}
}
