import { ChangeDetectorRef, Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  removeStatus: string
  addStatus: string
  error: string;
  title: string;
  email: string;
  wijk: string;

  isStanOfStephan: boolean;
  isRefreshing: boolean;
  loading: boolean;

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

    if (this.navParams.get('confirmationId')) {
      let result = await this.addAdmin(null, false, this.navParams.get('confirmationId'))
      if (result) alert('Gelukt om admin toe te voegen!')
      else alert('Mislukt om admin toe te voegen')
    }

    let self = this;
    document.querySelector('div.sticky-fab i.material-icons').addEventListener('animationiteration', function () {
      if (!self.loading) self.isRefreshing = false;
    })
  }

  async getAdmins() {
    this.loading = true
    let self = this;
    this.g.apiCall('getAdmins').then(function (result) {
      if (result.denied) {
        return;
      }
      self.isStanOfStephan = true;
      self.admins = result.admins;
      self.potentialAdmins = result.potentialAdmins;
      self.loading = false
    })
  }

  async addAdmin(email, force?, id?) {
    this.addStatus = 'Laden...'
    let result = await this.g.apiCall('addAdmin', { email: email, force: force, id: id })
    this.addStatus = result.success ? 'Gelukt!' : 'Niet gelukt... bestaat de gebruiker wel? en heeft hij/zij zijn/haar emailadres wel bevestigd?'

    let self = this
    setTimeout(function () {
      self.addStatus = ''
      self.cd.detectChanges()
    }, 2000)

    await this.getAdmins()

    return result.success
  }

  async removePotentialAdmin(email) {
    this.addStatus = 'Laden...'
    let result = await this.g.apiCall('removeAdmin', { email: email, force: true })
    this.addStatus = result.success ? 'Gelukt!' : 'Niet gelukt... (bestaat de gebruiker wel? en heeft hij/zij zijn/haar emailadres bevestigd?'

    let self = this
    setTimeout(function () {
      self.addStatus = ''
      self.cd.detectChanges()
    }, 2000)

    await this.getAdmins()
  }

  async removeAdmin(email) {
    this.removeStatus = 'Laden...'
    let result = await this.g.apiCall('removeAdmin', { email: email })
    if (result.success) {
      this.removeStatus = 'Gelukt!'
    } else {
      if (result.stanOfStephan) {
        this.removeStatus = 'Je kan Stan of Stephan niet verwijderen natuurlijk, grapjas...'
      } else {
        this.removeStatus = 'Niet gelukt... bestaat de user wel? en heeft hij/zij zijn/haar e-mailadres wel bevestigd?'
      }
    }

    let self = this
    setTimeout(function () {
      self.removeStatus = ''
      self.cd.detectChanges()
    }, 2000)

    await this.getAdmins()
  }

  adminPrompt() {
    let email = prompt('Van welk e-mailadres zou je de gebruiker als Admin willen aanwijzen?')

    this.addAdmin(email, true)
  }

  belStan() {
    window.location.href = 'tel:0640516654'
  }

  ionViewDidLoad() {
    this.init();
  }

  refreshData() {
    this.isRefreshing = true;
    this.getAdmins();
  }

  changeWijk() {
    this.navCtrl.setRoot(HomePage, { changeWijk: true }, { animate: true, animation: "ios-transition", direction: 'forward' });
  }
}
