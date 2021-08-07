import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
  selector: 'page-scan-ticket',
  templateUrl: 'scan-ticket.html',
})
export class ScanTicketPage {
  wristBandError: boolean;
  loadedTicket: boolean;
  loading: boolean;

  oldNumber: string;
  errorHelp: string;
  error: string;
  title: string;

  modal: {
    showModal: boolean;
  }
  ticket: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public storage: Storage,
    public g: GlobalFunctions
  ) {
    this.modal = {
      showModal: false
    }
    this.title = 'Gegevens Ticket';
    if (this.platform.is('cordova')) {
      if (cordova.platformId === 'android') {
        this.platform.registerBackButtonAction(() => {
          if (this.modal.showModal) {
            this.modal.showModal = false;
          } else {
            this.g.goHome();
          }
        });
      }
    }

    this.ticket = {
      id: this.navParams.get('barcode'),
      wristband: ''
    }
    this.loadedTicket = false;
  }

  init() {
    this.error = '';
    this.errorHelp = '';
    this.loading = false;
    this.wristBandError = false;
  }

  ionViewDidLoad() {
    this.init();
    this.loading = true;

    let self = this;
    this.g.apiCall('findChildById', { id: this.ticket.id }).then((result) => {
      self.loading = false;
      if (result.response !== 'success') {
        self.error = result.errorMessage || result.response;
        return;
      }
      self.ticket = result.ticket;
      self.loadedTicket = true;
      if (self.ticket.wristband) self.showModal()
    });
  }

  saveTicket() {
    if (!this.ticket.id || !this.ticket.wristband || this.ticket.wristband.length != 3) {
      return;
    }
    this.loading = true;
    let self = this;
    this.g.apiCall('assignWristband', {
      id: this.ticket.id,
      wristband: this.ticket.wristband
    }).then((result) => {
      self.loading = false;
      if (result.response === 'duplicate') {
        self.error = 'Polsbandje bestaat al';
        self.errorHelp = 'Ieder polsbandnummer mag maar één keer voorkomen.';
        return;
      }
      if (result.response !== 'success') {
        self.error = result.errorMessage || result.response;
        return;
      }
      self.storage.get('editHistory').then((val) => {
        let editHis = val || [];
        editHis.unshift({
          name: self.ticket.firstName + " " + self.ticket.lastName,
          oldNr: result.oldNumber || "onbekend",
          newNr: result.newNumber,
          wijk: self.g.getColor(self.ticket.hutnr)
        });
        self.storage.set("editHistory", editHis);
        console.log('porque?')

        self.g.goHome();
      }, (error) => {
        let editHis = [];
        editHis.unshift({
          name: self.ticket.firstName + " " + self.ticket.lastName,
          oldNr: result.oldNumber || "onbekend",
          newNr: result.newNumber,
          wijk: self.g.getColor(self.ticket.hutnr)
        });
        self.storage.set("editHistory", editHis);

        self.g.goHome();
      });
    });
  }

  closeModal() {
    this.modal.showModal = false;
    setTimeout(function () {
      console.log(document.querySelector('#myModal'))
      document.querySelector('#myModal').classList.remove('high');
    }, 400);
  }

  showModal() {
    this.modal.showModal = true;
    console.log(document.querySelector('#myModal'))
    document.querySelector('#myModal').classList.add('high');
  }

  goHome() {
    if (this.modal.showModal) {
      let self = this;
      this.modal.showModal = false;
      setTimeout(function () {
        self.g.goHome();
      }, 200);
    } else {
      this.g.goHome();
    }
  }
}
