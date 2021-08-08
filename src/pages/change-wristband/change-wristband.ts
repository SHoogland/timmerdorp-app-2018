import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';


@Component({
	selector: 'page-changeWristband',
	templateUrl: 'change-wristband.html'
})
export class ChangeWristbandPage {
	inputField: any;
	history: any;
	ticket: any;

	searchedTerm: string;
	errorHelp: string;
	oldNr: string;
	newNr: string;
	error: string;
	title: string;

	searched: boolean;
	loading: boolean;

	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient,
		public storage: Storage,
		public cd: ChangeDetectorRef,
		public g: GlobalFunctions
	) {
		this.title = 'Verander Polsbandje';
	}

	searchTicket() {
		let self = this;
		this.ticket = {};
    this.searched = false;
		if (this.oldNr.length < 3) {
			this.cd.detectChanges();
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		this.error = '';
		this.ticket = {};
		this.loading = true;
		this.searchedTerm = this.oldNr;
		console.log('searching: ' + this.oldNr);

    this.g.apiCall('findChildByWristband', { wristband: this.searchedTerm }).then((result) => {
      self.loading = false;
      if (result.response !== 'success') {
        self.error = result.errorMessage || result.response;
        return;
      }
      self.ticket = result.ticket;
      self.searched = true;
      self.cd.detectChanges();
      setTimeout(function () {
        if (document.getElementById("secondInput")) {
          let el = document.getElementById("secondInput").getElementsByTagName("input")[0];
          console.log(el);
          el.focus();
        }
      }, 250);
    });
	}

	valueChanged() {
		if (this.searched) {
			this.searched = false;
			this.loading = false;
			this.ticket = {}
		}
	}

	ionViewDidLoad() {
		this.searched = false;
		this.loading = false;
		this.loading = false;
		this.ticket = {};
		this.error = "";
		this.oldNr = "";
		this.newNr = "";
		Promise.all([
			this.storage.get('editHistory').then((val) => {
				this.history = val || [];
				console.log(this.history);
			}, (error) => {
				this.history = [];
			}),
		]).then(() => {
			let self = this;
			setInterval(function () {
				self.newNr;
			}, 200);
		});
	}

	saveNr() {
		this.error = '';
		this.loading = true;
		let self = this;

    this.g.apiCall('assignWristband', {
      id: this.ticket.id,
      wristband: this.newNr
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
          name: (self.ticket.nickName || self.ticket.firstName) + " " + self.ticket.lastName,
          oldNr: result.oldNumber || "onbekend",
          newNr: result.newNumber,
          wijk: self.g.getColor(self.ticket.hutNr)
        });
        self.storage.set("editHistory", editHis);

        self.g.goHome();
      }, (error) => {
        let editHis = [];
        editHis.unshift({
          name: (self.ticket.nickName || self.ticket.firstName) + " " + self.ticket.lastName,
          oldNr: result.oldNumber || "onbekend",
          newNr: result.newNumber,
          wijk: self.g.getColor(self.ticket.hutNr)
        });
        self.storage.set("editHistory", editHis);

        self.g.goHome();
      });
    })
	}

  newNrInput(event) {
    if(event.code === 'Enter') this.saveNr();
  }
}
