import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';

@Component({
	selector: 'page-wijk',
	templateUrl: 'wijk.html'
})
export class WijkPage {
	statistieken: object;

	title: string;
	error: string;
	wijk: string;

  isRefreshing: boolean;
	loginError: boolean;
	loading: boolean;

  eventListener: any;
	wijkprops: any;
	allprops: any;
  admins: any;
  wijken: any;

	constructor(
		public navCtrl: NavController,
		public storage: Storage,
		public g: GlobalFunctions
	) {
		this.init();
		this.loading = false;
		this.error = '';
    this.admins = [];
    this.isRefreshing = false;

		this.wijkprops = [
			{
				title: "Totaal aantal kinderen",
				prop: "count"
			},
			{
				title: "Aanwezig di",
				prop: "aanwezig_di"
			},
			{
				title: "Aanwezig wo",
				prop: "aanwezig_wo"
			},
			{
				title: "Aanwezig do",
				prop: "aanwezig_do"
			},
			{
				title: "Aanwezig vr",
				prop: "aanwezig_vr"
			}
		];

		this.allprops = [
			{
				title: "Totaal aantal kinderen",
				prop: "count"
			},
			{
				title: "Aantal kinderen met hutnummer",
				prop: "haveHutnr"
			},
			{
				title: "Aantal kinderen met armbandje",
				prop: "haveWristband"
			},
    ];

    this.wijken = []
	}

	async init() {
		this.wijk = (await this.storage.get('wijk')) || 'blue';
    this.wijken = ['yellow', 'red', 'blue', 'green'].sort((w) => (this.wijk === w ? -1 : 1))
    console.log(this.wijken)
    this.title = 'Statistieken';
    this.updateData();

    let self = this;
    document.querySelector('div.fab i.material-icons').addEventListener('animationiteration', function() {
      if(!self.loading) self.isRefreshing = false;
    })
	}

	updateData() {
		this.loading = true;

    let self = this;
    this.g.apiCall('wijkStats').then((result) => {
      if(!result || result.response !== 'success') {
        return;
      }
      console.log(result)

      self.statistieken = result;

      self.admins = result.adminList.sort(function(a, b) {
        return b.total - a.total
      }).filter(function(a) {
        return a.total
      })

      self.loading = false;
    });
	}

  refreshData() {
    this.isRefreshing = true;
    this.updateData();
  }
}
