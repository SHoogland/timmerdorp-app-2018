import { Component } from '@angular/core';
import { App, NavController, NavParams, Platform } from 'ionic-angular';
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

  isEditingTicket: boolean;
  isSearchingById: boolean;
  canEditTickets: boolean;
  searched: boolean;
  loading: boolean;

  searchTerm: string;
  errorHelp: string;
  title: string;
  error: string;

  modal: {
    showModal: boolean,
    high: boolean,
    child: any,
  }

  constructor(
    public navCtrl: NavController,
    public socialSharing: SocialSharing,
    public navParams: NavParams,
    public platform: Platform,
    public storage: Storage,
    public g: GlobalFunctions,
    private app: App,
  ) {
  }

  ngAfterViewInit() {
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
    this.modal = {
      child: null,
      showModal: false,
      high: false,
    }

    this.timeOut = setTimeout;

    if(this.navParams.get('searchTerm')) {
      this.searchTerm = this.navParams.get('searchTerm')
      this.searchThis()
    }

    this.loading = false;

    if(this.navParams.get('searchId')) {
      this.loading = true
      this.isSearchingById = true
      this.searchThis(this.navParams.get('searchId'))
    }

    this.error = '';
    this.errorHelp = '';

    this.ticketPropertiesMap = [];

    this.tableCategories = [
      {
        name: 'Gegevens Kind',
        props: ['birthdate', 'wristband', 'opmerkingen']
      },
      {
        name: 'Gegevens huisarts',
        props: ['naam_huisarts', 'tel_huisarts']
      },
      {
        name: 'Contactgegevens ouders',
        props: ['tel1', 'tel2', 'parent_email']
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
    if(this.isSearchingById) return
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


  async searchThis(searchId?) {
    let self = this;
    self.tickets = [];
    self.error = '';
    self.errorHelp = '';
    if (!this.isSearchingById && this.searchTerm.length < 3) {
      return false;
    }
    if (!searchId && this.isSearchingById) {
      return false;
    }
    self.loading = true;

    this.g.apiCall('search', { searchTerm: this.isSearchingById ? searchId : this.searchTerm }).then((result) => {
      self.loading = false
      if(!result || result.response !== 'success') {
        self.error = (result || {}).error || (result || {}).response
        self.errorHelp = (result || {}).errorMessage || (result || {}).response
        return;
      }

      if(!self.isSearchingById && self.searchTerm.length < 3) return

      self.searched = true
      self.tickets = result.tickets.sort(function (a) {
        if (a.wristband == self.searchTerm) {
          return -1;
        }
        return 1;
      }); //give priority to wristbands over hut numbers


      self.canEditTickets = result.canEditTickets
      self.ticketPropertiesMap = result.ticketPropertiesMap

      if(self.isSearchingById) {
        self.showModal(result.tickets[0])
        self.searchTerm = (result.tickets[0].nickName || result.tickets[0].firstName) + ' ' + result.tickets[0].lastName
        self.isSearchingById = false
      }
    }).catch((e) => {
      self.isSearchingById = false
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
    this.modal.high = true
  }

  closeModal() {
    this.modal.showModal = false;
    this.g.setStatusBar('blue')
    this.modal.high = false
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
    let msg = 'Moet je eens kijken naar Timmerdorp-deelnemer ' + (child.nickName || child.firstName) + '! Om dit te bekijken in die gave Timmerdorp-app, klik hier: https://shop.timmerdorp.com/app/kindje?id=' + child.id
    this.socialSharing.share(msg)
  }

  async saveTicketEdit() {
    let result = await this.g.apiCall('saveTicketEdit', { ticket: this.modal.child })
    if(!result || result.message != 'success') alert('hmmmm (geen response)')
    this.isEditingTicket = false
  }
}
