import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';

@Component({
	selector: 'loginpage',
	templateUrl: 'login.html',
})

export class LoginPage {
	error: string;
	endpoint: string;
	loading: boolean;
	day: string;
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
		public storage: Storage
	) {
		if (this.platform.is('cordova')) {
			this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		} else {
			// this.endpoint = 'https://timmerdorp.test/wp-json';
			this.endpoint = 'https://staging.timmerdorp.com/wp-json';
		}
		this.init();
	}

	init() {
		this.day = 'thu',
		this.login = {
			username: '',
			password: ''
		}
		this.loading = false;
		this.error = '';
		this.tickets = [];

		this.number = '';
		this.name = '';
		this.login = {
			username: '',
			password: ''
		}

		this.storage.get('username').then((val) => {
			this.login.username = val;
		}, (error) => {
			this.login.username = '';
		});

		this.storage.get('password').then((val) => {
			this.login.password = val;
		}, (error) => {
			this.login.password = '';
		});
	}


	loginNow() {
		// console.log(this.login);
		this.storage.set('username', this.login.username);
		this.storage.set('password', this.login.password);
	}

	toHome(){
		this.navCtrl.setRoot(HomePage);
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
}
