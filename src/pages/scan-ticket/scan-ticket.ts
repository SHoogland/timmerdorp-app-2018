import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as WPAPI from 'wpapi';

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
	login: {
		username: '',
		password: ''
	};
	ticket: {
		barcode: string;
		firstName: string,
		lastName: string
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
			lastName: ''
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
			let endpoint = ''
			if (this.platform.is('cordova')) {
				endpoint = 'https://shop.timmerdorp.com/wp-json';
			} else {
				endpoint = 'http://timmerdorp.test/wp-json';
			}

			var wp = new WPAPI({
				endpoint: endpoint,
				username: this.login.username,
				password: this.login.password
			});

			wp.handler = wp.registerRoute('tickets', 'barcode', {});
			// yields
			return wp.handler().param('barcode', this.navParams.get('barcode'));
		}).then((result) => {
			console.log(result);
			self.ticket.barcode = result.meta.WooCommerceEventsTicketID[0];
			self.ticket.firstName = result.meta.fooevents_custom_voornaam[0];
			self.ticket.lastName = result.meta.fooevents_custom_achternaam[0];
		});
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ScanTicketPage');
	}

}
