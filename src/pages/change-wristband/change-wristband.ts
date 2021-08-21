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
		this.ticket = null;
    this.searched = false;
		if (this.oldNr.length < 3) {
			this.cd.detectChanges();
			return false;
		}
		this.error = '';
		this.ticket = null;
		this.loading = true;
		this.searchedTerm = this.oldNr;

    this.g.apiCall('findChildByWristband', { wristband: this.searchedTerm }).then((result) => {
      self.loading = false;
      if (result.response !== 'success') {
        self.error = result.errorMessage || result.response;
        self.searched = true;
        return;
      }
      self.ticket = result.ticket;
      self.searched = true;
      self.cd.detectChanges();
      setTimeout(function () {
        if (document.getElementById("secondInput")) {
          let el = document.getElementById("secondInput").getElementsByTagName("input")[0];
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
		this.ticket = null;
		this.error = "";
		this.oldNr = "";
		this.newNr = "";
    let self = this;
    setInterval(function () {
      self.newNr;
    }, 200);
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

      self.g.goHome();
    })
	}

  newNrInput(event) {
    if(event.code === 'Enter') this.saveNr();
  }
}
