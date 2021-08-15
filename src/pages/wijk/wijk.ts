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
	wijkstats: object;

	title: string;
	error: string;
	wijk: string;

	showSelection: boolean;
	loginError: boolean;
	loading: boolean;

	wijkprops: any;
	allprops: any;
  admins: any;

	constructor(
		public navCtrl: NavController,
		public storage: Storage,
		public g: GlobalFunctions
	) {
		this.init();
		this.showSelection = false;
		this.loading = false;
		this.error = '';
    this.admins = [];

		this.wijkprops = [
			{
				title: "Totaal aantal kinderen in wijk",
				prop: "count"
			},
			{
				title: "Aanwezig dinsdag",
				prop: "aanwezig_di"
			},
			{
				title: "Aanwezig woensdag",
				prop: "aanwezig_wo"
			},
			{
				title: "Aanwezig donderdag",
				prop: "aanwezig_do"
			},
			{
				title: "Aanwezig vrijdag",
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
			{
				title: "Aanwezig dinsdag",
				prop: "aanwezig_di"
			},
			{
				title: "Aanwezig woensdag",
				prop: "aanwezig_wo"
			},
			{
				title: "Aanwezig donderdag",
				prop: "aanwezig_do"
			},
			{
				title: "Aanwezig vrijdag",
				prop: "aanwezig_vr"
			}
		]
	}

	init() {
		this.wijk = '';
		Promise.all([
			this.storage.get('wijk').then((val) => {
				if (!val) {
					this.showSelection = true;
				} else {
					this.wijk = val;
					this.g.setStatusBar(this.wijk);
				}
			}),
		]).then(() => {
			this.title = 'Wijk ' + this.g.getWijkName(this.wijk);
			this.updateData();
		});
	}

	updateData() {
		this.loading = true;
		console.log(this.wijk);

    let self = this;
    this.g.apiCall('wijkStats').then((result) => {
      if(!result || result.response !== 'success') {
        if(!result || result.response !== 'success') {
          return;
        }
      }
      self.wijkstats = result.quarters[this.wijk];
      self.statistieken = result;

      self.admins = result.adminList.sort(function(a, b) {
        return b.total - a.total
      })
      self.loading = false;
    });
	}

	kiesWijk(kleur) {
		this.g.setStatusBar(kleur);
		this.storage.set("wijk", kleur).then((val) => {
			this.showSelection = false;
			this.wijk = val;
			this.title = 'Wijk ' + this.g.getWijkName(this.wijk);
			this.updateData();
		});
	}

	clearWijkSelection() {
		this.g.setStatusBar("#cccccc");
		this.wijkstats = {};
		this.storage.set("wijk", undefined).then((val) => {
			this.showSelection = true;
			this.wijk = undefined;
		});
	}
}
