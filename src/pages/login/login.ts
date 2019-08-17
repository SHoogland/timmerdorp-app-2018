import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';

@Component({
	selector: 'loginpage',
	templateUrl: 'login.html'
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

	success: boolean;
	usernameError: boolean;
	passwordError: boolean;

	number: string;
	name: string;

	clickedOnce = false;
	clickedTwice = false;
	staging = false;
	allowStaging = !(new Date().getDay() > 1 && new Date().getDay() < 6); //don't allow tuesday through friday

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
		this.usernameError = false;
		this.passwordError = false;
		this.success = false;

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

		this.storage.get('staging').then((val) => {
			this.staging = val;
			if(val){
				this.endpoint = 'https://staging.timmerdorp.com/wp-json';
			} else{
				this.endpoint = 'https://shop.timmerdorp.com/wp-json';
			}
		}, (error) => {
			this.staging = false;
			this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		})

	}


	loginNow() {
		this.storage.set('username', this.login.username);
		this.storage.set('password', this.login.password);

		this.checkLogin();
	}

	checkLogin() {
		this.loading = true;
		this.success = false;
		this.usernameError = false;
		this.passwordError = false;
		console.log("Determining whether login is correct by searching for random child '000'...")
		//Try searching for random term: "000". If it fails, login details probably are incorrect
		var wp = this.getWpApi('search');
		wp.handler().param('search', "000").then((result) => {
			this.loading = false;
			if (result.code === 200) {
				this.success = true;
				this.usernameError = false;
				this.passwordError = false;
				console.log("Succesvol ingelogd!");
				setTimeout(() => {this.goHome()}, 800);
			} else if (result.message === 'access denied') { // user probably didn't fill in username & password at all.
				this.success = false;
				this.usernameError = false;
				this.passwordError = true;
				console.log("Verkeerd wachtwoord!");
			} else {
				console.log(result);
			}

			this.cd.detectChanges();
		}).catch((error) => {
			console.log(error)
			this.loading = false;
			if (error.code === 'invalid_username') {
				this.success = false;
				this.usernameError = true;
				this.passwordError = false;
				console.log("Verkeerde gebruikersnaam!");
			} else if (error.code === 'incorrect_password') {
				this.success = false;
				this.usernameError = false;
				this.passwordError = true;
				console.log("Verkeerd wachtwoord!");
			} else {
				console.log(error);//user is offline (probably)
			}
			this.cd.detectChanges();
		});
	}

	toHome() {
		this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: "back"});
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


	switchEnv(){
		const _this = this;
		setTimeout(function(){
			_this.clickedOnce = false;
			_this.clickedTwice = false;
		}, 1000)
		if(this.clickedTwice){
			if(!this.staging){
				this.storage.set('staging', true);
				this.staging = true;
				this.endpoint = 'https://staging.timmerdorp.com/wp-json';
			} else {
				this.storage.set('staging', false);
				this.staging = false;
				this.endpoint = 'https://shop.timmerdorp.com/wp-json';
			}
			this.clickedOnce = false;
			this.clickedTwice = false;
		}
		if(this.clickedOnce){
			this.clickedTwice = true;
		}
		this.clickedOnce = true;
		this.cd.detectChanges();
	}


	goHome() {
		this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: "back"});
	}
}
