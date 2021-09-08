import { ChangeDetectorRef, Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';

@Component({
	selector: 'page-app-info',
	templateUrl: 'app-info.html'
})
export class AppInfoPage {
  removeStatus: string
  addStatus: string
	error: string;
	title: string;
  email: string;
	wijk: string;

  isStanOfStephan: boolean;

  admins: Array<any>;
  potentialAdmins: Array<any>;

	constructor(
		public navCtrl: NavController,
    public navParams: NavParams,
		public platform: Platform,
		public storage: Storage,
		public httpClient: HttpClient,
		public g: GlobalFunctions,
		private cd: ChangeDetectorRef
  ) {
	}

	async init() {
		this.title = 'App info';
    this.addStatus = ''
    this.removeStatus = ''
    this.potentialAdmins = []
    this.admins = []
    this.isStanOfStephan = false;


    this.storage.get('wijk').then((val) => {
      this.wijk = val;
		});

    await this.getAdmins()
    this.email = (await this.g.checkIfStillLoggedIn()).email

    if(this.navParams.get('confirmationId')) {
      let result = await this.addAdmin(false, true, this.navParams.get('confirmationId'))
      if(result) alert('Gelukt om admin toe te voegen!')
      else alert('Mislukt om admin toe te voegen')
    }
	}

  async getAdmins() {
    let self = this;
    this.g.apiCall('getAdmins').then(function(result) {
      if(result.denied) {
        return;
      }
      self.isStanOfStephan = true;
      self.admins = result.admins;
      self.potentialAdmins = result.potentialAdmins;
    })
  }

  async addAdmin(email, force?, id?) {
    this.addStatus = 'Laden...'
    let result = await this.g.apiCall('addAdmin', { email: email, force: force, id: id })
    this.addStatus = result.success ? 'Gelukt!' : 'Niet gelukt...'

    let self = this
    setTimeout(function(){
      self.addStatus = ''
      self.cd.detectChanges()
    }, 1000)

    await this.getAdmins()

    return result.success
  }

  async removePotentialAdmin(email) {
    this.addStatus = 'Laden...'
    let result = await this.g.apiCall('removeAdmin', { email: email, force: true })
    this.addStatus = result.success ? 'Gelukt!' : 'Niet gelukt...'

    let self = this
    setTimeout(function(){
      self.addStatus = ''
      self.cd.detectChanges()
    }, 1000)

    await this.getAdmins()
  }

  async removeAdmin(email) {
    this.removeStatus = 'Laden...'
    let result = await this.g.apiCall('removeAdmin', { email: email })
    if(result.success) {
      this.removeStatus = 'Gelukt!'
    } else {
      if(result.stanOfStephan) {
        this.removeStatus = 'Je kan Stan of Stephan niet verwijderen natuurlijk, grapjas...'
      } else {
        this.removeStatus = 'Niet gelukt...'
      }
    }

    let self = this
    setTimeout(function(){
      self.removeStatus = ''
      self.cd.detectChanges()
    }, 1000)

    await this.getAdmins()
  }

  adminPrompt () {
    let email = prompt('Van welk e-mailadres zou je de gebruiker als Admin willen aanwijzen?')

    this.addAdmin(email, true)
  }

	belStan() {
		window.location.href = 'tel:0640516654'
	}

	ionViewDidLoad() {
		this.init();
	}
}
