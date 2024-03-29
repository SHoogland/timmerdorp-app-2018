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
  disableSoleCheckbox: boolean;
  wristBandError: boolean;
  showSuggestion: boolean;
  loadedTicket: boolean;
  loadingSole: boolean;
  loading: boolean;

  oldNumber: string;
  errorHelp: string;
  error: string;
  title: string;

  suggestionNumber: number;

  modal: {
    showModal: boolean;
    high: boolean;
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
      showModal: false,
      high: false
    }
    this.title = 'Ticketgegevens';
    if (this.platform.is('cordova')) {
      if (cordova.platformId === 'android') {
        this.platform.registerBackButtonAction(() => {
          if (this.modal.showModal) {
            this.closeModal()
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

    if (!this.ticket.id) this.g.goHome();
    this.loadedTicket = false;
  }

  async init() {
    this.error = '';
    this.errorHelp = '';
    this.loading = false;
    this.wristBandError = false;

    let d = await this.storage.get('lastWristbandAssignmentDate')
    if (+new Date() - d < 10 * 60 * 1000) {
      this.showSuggestion = true;
      this.suggestionNumber = (1 + +(await this.storage.get('lastWristbandAssignmentNumber')))
    }
  }

  ionViewDidLoad() {
    this.init();
    this.loading = true;

    let self = this;
    this.g.apiCall('findChildById', { id: this.ticket.id }).then(async function (result) {
      self.loading = false;
      if (result.response !== 'success') {
        self.error = result.error || result.response;
        self.errorHelp = result.errorMessage || result.response;
        return;
      }
      let ticket = result.ticket;

      let history = await self.storage.get('searchChildHistory') || []
      history.unshift({
        firstName: ticket.firstName,
        lastName: ticket.lastName,
        wristband: ticket.wristband,
        hutNr: ticket.hutNr,
        wijk: self.g.getColor(ticket.hutNr),
        id: ticket.id,
      });

      self.storage.set("searchChildHistory", self.g.filterHistory(history));
      self.ticket = ticket;
      self.loadedTicket = true;
      if (self.ticket.wristband) self.showModal()
    });
  }

  collectSole() {
    this.loadingSole = true
    let self = this
    this.g.apiCall('collectSole', {
      id: this.ticket.id,
    }).then((result) => {
      self.loadingSole = false
      self.ticket.collectedSole = true
    })
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

      self.storage.set('lastWristbandAssignmentDate', +new Date());
      self.storage.set('lastWristbandAssignmentNumber', result.newNumber);

      self.storage.get('editHistory').then((val) => {
        let editHis = val || [];
        editHis.unshift({
          name: (self.ticket.firstName) + " " + self.ticket.lastName,
          oldNr: result.oldNumber || "onbekend",
          newNr: result.newNumber,
          wijk: self.g.getColor(self.ticket.hutNr)
        });
        self.storage.set("editHistory", editHis);

        self.g.goHome();
      }, (error) => {
        let editHis = [];
        editHis.unshift({
          name: (self.ticket.firstName) + " " + self.ticket.lastName,
          oldNr: result.oldNumber || "onbekend",
          newNr: result.newNumber,
          wijk: self.g.getColor(self.ticket.hutNr)
        });
        self.storage.set("editHistory", editHis);

        self.g.goHome();
      });
    });
  }

  bandNrInput(e) {
    if (e.key === "Enter") this.saveTicket()
  }

  closeModal() {
    this.modal.showModal = false;
    let self = this
    setTimeout(function () {
      self.modal.high = false
    }, 400);
  }

  showModal() {
    this.modal.showModal = true;
    this.modal.high = true;
  }

  goHome() {
    if (this.modal.showModal) {
      this.closeModal();
      let self = this;
      setTimeout(function () {
        self.g.goHome();
      }, 200);
    } else {
      this.g.goHome();
    }
  }

  prependZeroes(num) {
    return (num + '').length === 1 ? '00' + num : num;
  }
}
