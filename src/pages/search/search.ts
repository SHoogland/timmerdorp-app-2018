import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalFunctions } from '../../providers/global';

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

  loading: boolean;
  searched: boolean;

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
    public navParams: NavParams,
    public platform: Platform,
    public storage: Storage,
    public sanitizer: DomSanitizer,
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
        props: ["tel1", "tel2"]
      },
      {
        name: "Gegevens Kind",
        props: ["nickName", "birthdate", "wristband", "hutNr", "opmerkingen"]
      },
    ]
    this.tickets = [];
  }

  ionViewDidLoad() {
    Promise.all([
      this.storage.get('searchChildHistory').then((val) => {
        this.history = val || [];
        console.log(this.history);
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
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => {
        this.searchThis();
      }, 100);
    } catch (e) {
      console.log(e);
    }
  }

  filterPhoneNr(num) {
    return (num || [""])[0].replace(/[^0-9+]/g, '');
  }


  async searchThis() {
    let self = this;
    self.tickets = [];
    self.error = '';
    self.errorHelp = '';
    if (this.searchTerm.length < 3) {
      console.log("Cancelling search. Reason: term too short");
      return false;
    }
    self.loading = true;

    console.log('searching: ' + this.searchTerm);
    this.g.apiCall('search', { searchTerm: this.searchTerm }).then((result) => {
      if(!result || result.response !== 'success') {
        self.error = (result || {}).error || (result || {}).response
        self.errorHelp = (result || {}).errorMessage || (result || {}).response
        return;
      }
      self.loading = false
      self.searched = true
      self.tickets = result.tickets.sort(function (a) {
        if ((a.wristband || [])[0] == self.searchTerm) {
          return -1;
        }
        return 1;
      }); //give priority to wristbands over hut numbers
      self.ticketPropertiesMap = result.ticketPropertiesMap
    }).catch((e) => {
      self.error = String(e)
    });
  }

  showModal(child) {
    this.modal.child = child;
    this.modal.showModal = true;
    this.history.unshift({
      firstName: child.firstName,
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
    setTimeout(function () {
      document.querySelector('#myModal').classList.remove('high');
    }, 400);
  }

  scanChild(barcode) {
    this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcode });
  }

  goHome() {
    if (this.modal.showModal) {
      let self = this;
      this.closeModal();
      setTimeout(function () {
        this.g.goHome();
      }, 400);
    } else {
      this.g.goHome();
    }
  }
}
