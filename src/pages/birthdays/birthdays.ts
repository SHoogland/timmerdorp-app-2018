import { Component, ViewChild } from '@angular/core';
import { NavController, Content } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { GlobalFunctions } from '../../providers/global';
import { Storage } from '@ionic/storage';
import { SearchPage } from '../search/search';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';


@Component({
	selector: 'page-birthdays',
	templateUrl: 'birthdays.html'
})
export class BirthdaysPage {
	@ViewChild(Content) content: Content;
	loading: boolean;
	title: string;
  data: any;
  days: any;
  dates: any;

	constructor(
		public navCtrl: NavController,
    public socialSharing: SocialSharing,
		public httpClient: HttpClient,
		public g: GlobalFunctions,
		public storage: Storage
	) {
	}

	async init() {
		this.title = 'Verjaardagen';
		this.loading = true;
    this.days = ['di', 'wo', 'do', 'vr']
    this.dates = ['Dinsdag 23 augustus', 'Woensdag 24 augustus', 'Donderdag 25 augustus', 'Vrijdag 26 augustus']

    let self = this;
    this.g.apiCall('wijkStats').then(async function(result) {
      self.loading = false;
      if (!result || result.response !== 'success') {
        return;
      }
      self.data = result.birthdays
      setTimeout(function () {
        let dag = ['di', 'wo', 'do', 'vr'][new Date().getDay() - 2];
        let el = document.getElementById(dag);
        if (el) {
          self.content.scrollTo(0, el.offsetTop - 12, 600);
        }
      }, 200);
    });
	}

  shareDate(d){
    let bdays = this.data[d].kids
    let getBdayMsg = (bday) => bday.name + ' uit hutje ' + bday.hutNr + ' (wijk ' + this.g.getWijk(bday.hutNr) + ') wordt ' + bday.newAge + '!'
    let msg = `Vandaag ${bdays.length > 1 ? 'zijn' : 'is'} er op Timmerdorp ${bdays.length} verjaardag${bdays.length > 1 ? 'en!\n -' : '!'} ${bdays.map(getBdayMsg).join('\n - ')}`

    msg += '\n\nVergeten jullie niet te feliciteren?'
    this.socialSharing.share(msg)
  }

	getDate() {
		return this.g.prependZero(new Date().getMonth() + 1) + "-" + this.g.prependZero(new Date().getDate()) + "-" + new Date().getFullYear();
	}

	getTime() {
		let pz = this.g.prependZero;
		let time = new Date();
		return pz(time.getHours()) + ":" + pz(time.getMinutes());
	}

	ionViewDidLoad() {
		this.init();
	}

  zoekKind(kind) {
    this.navCtrl.push(SearchPage, { searchTerm: kind.name }, { animate: true, animation: "ios-transition", direction: 'forward' });
  }
}
