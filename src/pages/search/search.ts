import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { GlobalFunctions } from '../../providers/global';
import { PresencePage } from '../presence/presence';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

declare let cordova: any;

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  tableCategories: any;
  ticketPropertiesMap: any;
  typingTimer: any;
  timeOut: any;
  tickets: any;
  history: any;

  isSearchingById: boolean;
  searched: boolean;
  loading: boolean;

  searchTerm: string;
  errorHelp: string;
  title: string;
  error: string;

  modal: {
    showModal: boolean;
    child: any;
  }

  constructor(
    public navCtrl: NavController,
    public socialSharing: SocialSharing,
    public navParams: NavParams,
    public platform: Platform,
    public storage: Storage,
    public g: GlobalFunctions
  ) {
    this.searched = false;
    this.title = 'Kinderen Zoeken'
    if (this.platform.is('cordova')) {
      if (cordova.platformId === 'android') {
        this.platform.registerBackButtonAction(() => {
          if (this.modal.showModal) {
            this.closeModal();
          } else {
            this.g.goHome();
          }
        });
      }
    }
    this.init();
  }

  init() {
    this.modal = {
      child: null,
      showModal: false
    }

    this.timeOut = setTimeout;

    if(this.navParams.get('searchTerm')) {
      this.searchTerm = this.navParams.get('searchTerm')
      this.searchThis()
    }

    if(this.navParams.get('searchId')) {
      let self = this
      this.loading = true
      this.isSearchingById = true
      this.g.apiCall('search', { searchTerm: this.navParams.get('searchId') }).then((result) => {
        self.isSearchingById = false
        self.loading = false
        if(!result || result.response !== 'success') {
          self.error = (result || {}).error || (result || {}).response
          self.errorHelp = (result || {}).errorMessage || (result || {}).response
          return;
        }
        self.searched = true
        self.tickets = result.tickets
        self.showModal(result.tickets[0])
        self.searchTerm = (result.tickets[0].nickName || result.tickets[0].firstName) + ' ' + result.tickets[0].lastName
        self.ticketPropertiesMap = result.ticketPropertiesMap
      }).catch((e) => {
        self.loading = false
        self.isSearchingById = false
        self.error = String(e)
      });
    }

    this.loading = false;

    this.error = '';
    this.errorHelp = '';

    this.ticketPropertiesMap = [];

    this.tableCategories = [
      {
        name: "Gegevens huisarts",
        props: ["naam_huisarts", "tel_huisarts"]
      },
      {
        name: "Contactgegevens ouders",
        props: ["tel1", "tel2", "parent_email"]
      },
      {
        name: "Gegevens Kind",
        props: ["birthdate", "wristband", "hutNr", "opmerkingen"]
      },
    ]
    this.tickets = [];
  }

  ionViewDidLoad() {
    Promise.all([
      this.storage.get('searchChildHistory').then((val) => {
        this.history = val || [];
        this.history = this.g.filterHistory(this.history);
      }, (error) => {
        this.history = [];
      }),
    ]).then(() => {
      let self = this;
      setInterval(function () {
        self.error;
      }, 100);
    });
  }

  search() {
    this.searched = false
    try {
      if (this.searchTerm.length < 3) {
        this.tickets = [];
        return false;
      }
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => {
        this.searchThis();
      }, 500);
    } catch (e) {
      console.log(e);
    }
  }

  filterPhoneNr(num) {
    return num.replace(/[^0-9+]/g, '');
  }


  async searchThis() {
    let self = this;
    self.tickets = [];
    self.error = '';
    self.errorHelp = '';
    if (this.searchTerm.length < 3) {
      return false;
    }
    self.loading = true;

    this.g.apiCall('search', { searchTerm: this.searchTerm }).then((result) => {
      self.loading = false
      if(!result || result.response !== 'success') {
        self.error = (result || {}).error || (result || {}).response
        self.errorHelp = (result || {}).errorMessage || (result || {}).response
        return;
      }
      if(self.searchTerm.length < 3) return
      self.searched = true
      self.tickets = result.tickets.sort(function (a) {
        if (a.wristband == self.searchTerm) {
          return -1;
        }
        return 1;
      }); //give priority to wristbands over hut numbers
      self.ticketPropertiesMap = result.ticketPropertiesMap
    }).catch((e) => {
      self.loading = false
      self.error = String(e)
    });
  }

  showModal(child) {
    this.modal.child = child;
    this.g.setStatusBar(['yellow', 'red', 'blue', 'green'][(child.hutNr || "2")[0]])
    this.modal.showModal = true;
    this.history.unshift({
      firstName: child.nickName || child.firstName,
      lastName: child.lastName,
      wristband: child.wristband,
      hutNr: child.hutNr,
      wijk: this.g.getColor(child.hutNr)
    });
    this.history = this.g.filterHistory(this.history);
    this.storage.set("searchChildHistory", this.history);
    document.querySelector('#myModal').classList.add('high');
  }

  closeModal() {
    this.modal.showModal = false;
    this.g.setStatusBar('blue')
    setTimeout(function () {
      document.querySelector('#myModal').classList.remove('high');
    }, 400);
  }

  scanChild(barcode) {
    this.g.setStatusBar('blue')
    this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcode }, { animate: true, animation: "ios-transition", direction: 'forward' });
  }

  goHome() {
    this.g.setStatusBar('blue')
    if (this.modal.showModal) {
      let self = this;
      this.closeModal();
      setTimeout(function () {
        self.g.goHome();
      }, 400);
    } else {
      this.g.goHome();
    }
  }

  markPresent(wristband) {
    this.g.setStatusBar('blue')
    this.navCtrl.setRoot(PresencePage, { 'wristband': wristband }, { animate: true, animation: "ios-transition", direction: 'forward' });
  }

  shareChild(child) {
    let msg = 'Moet je eens kijken naar Timmerdorp-deelnemer ' + (child.nickName || child.firstName) + ' in die fantastische Timmerdorp-app, klik dan hier: https://shop.timmerdorp.com/app/kindje?id=' + child.id
    this.socialSharing.share(msg)
  }
}
