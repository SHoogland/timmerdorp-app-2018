import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as WPAPI from 'wpapi';
import { HomePage } from '../home/home';

/**
 * Generated class for the ScanTicketPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-scan-ticket',
	templateUrl: 'scan-ticket.html',
})
export class ScanTicketPage {
	error: string;
	endpoint: string;
	loading: boolean;
	wristBandError: boolean;
	login: {
		username: string,
		password: string
	};
	ticket: {
		barcode: string;
		firstName: string,
		lastName: string,
		birthDate: string,
		wristBandNr: string
	};

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public storage: Storage
	) {

		this.login = {
			username: '',
			password: ''
		}
		this.ticket = {
			barcode: '',
			firstName: '',
			lastName: '',
			birthDate: '',
			wristBandNr: ''
		}
		this.loading = true;
		this.wristBandError = false;
		
		if (this.platform.is('cordova')) {
			this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		} else {
			this.endpoint = 'https://timmerdorp.test/wp-json';
		}

		let self = this;

		Promise.all([
			storage.get('username').then((val) => {
				this.login.username = val;
				console.log('Your username is:' + val);
			}, (error) => {
				console.log('no username found');
				this.login.username = '';
			}),
			storage.get('password').then((val) => {
				this.login.password = val;
				console.log('Your password is:' + val);
			}, (error) => {
				console.log('no password found');
				this.login.password = '';
			})
		]).then(() => {
			var wp = new WPAPI({
				endpoint: this.endpoint,
				username: this.login.username,
				password: this.login.password
			});

			wp.handler = wp.registerRoute('tickets', 'barcode', {});
			// yields
			return wp.handler().param('barcode', this.navParams.get('barcode'));
		}).then((result) => {
			console.log(result);
			if (result.code === 200) {
				self.ticket.barcode = result.meta.WooCommerceEventsTicketID[0];
				self.ticket.firstName = result.meta.fooevents_custom_voornaam[0];
				self.ticket.lastName = result.meta.fooevents_custom_achternaam[0];
				self.ticket.birthDate = result.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)'][0];
				
				self.loading = false;
			} else {
				self.error = result.message;
				self.loading = false;
			}
		}).catch((error)=>{
			self.error = error.message;
			self.loading = false;

		});
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ScanTicketPage');
	}

	saveTicket(){
		var wp = new WPAPI({
			endpoint: this.endpoint,
			username: this.login.username,
			password: this.login.password
		});

		wp.handler = wp.registerRoute('tickets', 'barcode', {});
		// yields
		return wp.handler().param('barcode', this.navParams.get('barcode'));
	}

	goBack() {
		this.navCtrl.setRoot(HomePage);
	}

}
