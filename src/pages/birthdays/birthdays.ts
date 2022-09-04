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
  error: boolean;
	title: string;
  today: any;
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
    this.dates = []
    this.today = new Date()

    let self = this;
    this.g.apiCall('wijkStats').then(async function(result) {
      self.loading = false;
      if (!result || result.response !== 'success') {
        self.error = true
        return;
      }
      self.data = result.birthdays
      self.today = result.todayDate
      self.dates = result.tdDates.map(self.parseDate)
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
    this.navCtrl.push(SearchPage, { searchTerm: kind.name }, this.g.forwardNavConfig);
  }

  parseDate(d) {
    let weekDays = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
    let months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
    // ^het lijkt me onwaarschijnlijk dat er ooit een verjaardag tijdens Timmerdorp gaat zijn in december, maar je weet maar nooit of er ooit nog een Winterdorp komt
    return weekDays[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()]
  }

  beforeToday(d) {
    if(!d || !this.today) return false
    d = new Date(d)
    let testD = new Date()
    testD.setDate(d.getDate())
    testD.setMonth(d.getMonth())
    let comparedD = +testD
    testD.setDate(this.today.getDate())
    testD.setMonth(this.today.getMonth())
    let todayD = +testD
    return comparedD <= todayD
  }
}
