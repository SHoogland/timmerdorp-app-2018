import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GlobalFunctions } from '../../providers/global';
import { Storage } from '@ionic/storage';
import Parse from 'parse';

@Component({
  selector: 'page-hutjes-map',
  templateUrl: 'hutjes-map.html'
})
export class HutjesMapPage {
  zoomedInFromHutHighlight: boolean;
  hasZoomedInToLocation: boolean;
  hasSelectedLocation: boolean;
  isSavingLocation: boolean;
  savingFromButton: boolean;
  foundLocation: boolean;
  stanOfStephan: boolean;
  showHighlight: boolean;
  showModalHigh: boolean;
  isRefreshing: boolean;
  preventHome: boolean;
  hutNotFound: boolean;
  showModal: boolean;
  zoomedIn: boolean;
  loading: boolean;

  selectionHighlightLeft: string;
  selectionHighlightTop: string;
  hutIndicatorLeft: string;
  hutIndicatorTop: string;
  locIndicatorLeft: string;
  locIndicatorTop: string;
  zoomBottom: string;
  zoomRight: string;
  mapImgSrc: string;
  zoomLeft: string;
  zoomTop: string;
  title: string;
  hutNr: string;

  bottomRightLat: number;
  bottomRightLng: number;
  currentZoomX: number;
  currentZoomY: number;
  pageOpenTime: number;
  defaultSize: number;
  canvasWidth: number
  topLeftLat: number;
  topLeftLng: number;
  zoomFactor: number;
  mapHeight: number; // distance from topmost to bottommost point on the map, in meters
  mapWidth: number; // same but from left to right

  locationSubscription: any;
  locUpdateInterval: any;
  selectedLocation: any;
  highlightedHut: any;
  mapSize: any;
  mapImg: any;
  hutjes: any;
  canvas: any;

  constructor(
    public navCtrl: NavController,
    public httpClient: HttpClient,
    public g: GlobalFunctions,
    public storage: Storage,
    public geolocation: Geolocation,
    public navParams: NavParams,
  ) {
    this.zoomFactor = 3.5
    this.loading = true;
    this.preventHome = false
    this.title = "Hutjeskaart"


    if (this.navParams.get('saveLocation')) {
      this.isSavingLocation = true
      this.hutNr = this.navParams.get('hutNr')
      let self = this
      this.storage.get('dontShowLocationModalAgain').then((dontShowModal) => {
        if (!dontShowModal) {
          self.showModal = true
          self.showModalHigh = true;
        }
      })
    }
  }

  ionViewDidEnter() {
    this.init();
  }

  init() {
    this.pageOpenTime = +new Date()
    this.updateData()
  }

  updateData(callback?) {
    let self = this;
    this.g.apiCall('getHutjesMap').then(async function (result) {
      if (!result || result.response !== 'success') {
        return;
      }
      self.hutjes = result.hutjes
      self.stanOfStephan = result.stanOfStephan
      self.defaultSize = result.mapData.defaultSize
      self.mapImgSrc = result.mapData.mapImgSrc
      self.canvasWidth = result.mapData.canvasWidth
      self.topLeftLat = result.mapData.topLeftLat
      self.topLeftLng = result.mapData.topLeftLng
      self.bottomRightLat = result.mapData.bottomRightLat
      self.bottomRightLng = result.mapData.bottomRightLng
      self.loadImage(self)
      self.isRefreshing = false
    })
  }

  loadImage(self) {
    if(self.mapImg) {
      self.drawCanvas()
      return
    }

    let c = (document.getElementsByTagName('canvas') || [])[0]
    if (!c) return
    this.canvas = c.getContext('2d');
    this.mapImg = new window.Image();
    self.mapImg.addEventListener('load', function () {
      self.loading = false;
      self.drawCanvas()

      self.getLocationOnce(self)
      self.getLocationOnce(self) // doing it twice improves accuracy according to https://stackoverflow.com/a/31916631
      self.locUpdateInterval = setInterval(self.getLocationOnce, 10000, self)

      self.locationSubscription = self.geolocation.watchPosition({ enableHighAccuracy: true }).subscribe((data) => {
        self.updateLocIndicator(data, self)
      })

      if (self.navParams.get('hutNr') && !self.isSavingLocation) {
        self.hutNr = self.navParams.get('hutNr')
        self.searchHut(self.hutNr)
      }
    })
    this.mapImg.src = self.mapImgSrc
  }

  getLocationOnce(self) {
    self.geolocation.getCurrentPosition({ timeout: 10000 }).then((data) => {
      self.updateLocIndicator(data, self)
    })
  }

  drawCanvas() {
    let proportion = this.mapImg.width / this.mapImg.height
    let w = this.canvas.canvas.width
    let h = w / proportion
    this.canvas.canvas.height = h
    this.mapSize = { w, h }
    this.canvas.drawImage(this.mapImg, 0, 0, w, h)

    let coords = this.coordinatesInMetersFromTopLeft(this.bottomRightLat, this.bottomRightLng)
    this.mapWidth = coords.x
    this.mapHeight = coords.y

    this.canvas.textAlign = "center";
    for (let i = 0; i < this.hutjes.length; i++) {
      this.canvas.beginPath()
      let hutje = this.hutjes[i]
      let loc = hutje.location
      coords = this.coordinatesInMetersFromTopLeft(loc.latitude, loc.longitude)
      let x = coords.x / this.mapWidth * this.canvas.canvas.width
      let y = coords.y / this.mapHeight * this.canvas.canvas.height
      let size = hutje.size || this.defaultSize
      let fontSize = Math.round(size / 2)
      this.canvas.font = fontSize + "px Arial";
      this.canvas.rect(x, y, size, size);
      this.canvas.fillStyle = hutje.color || this.g.getColor(hutje.hutNr);
      this.canvas.fill();
      this.canvas.fillStyle = "black"
      this.canvas.fillText(hutje.hutNr || '', x + size / 2, y + size / 2 + fontSize / 2)
    }
  }

  coordinatesInMetersFromTopLeft(lat, lng) {
    let earthCircumference = 40075 * 1000;
    let mapWidthInDegrees = lng - this.topLeftLng
    let x = mapWidthInDegrees * earthCircumference / 360 * Math.cos(this.topLeftLat / 180 * Math.PI)
    let mapHeightInDegrees = this.topLeftLat - lat
    let y = mapHeightInDegrees * earthCircumference / 360;
    return { x, y }
  }

  searchHut(hutNr) {
    this.hutNotFound = false
    if (hutNr.length != 3 || isNaN(hutNr)) {
      if (this.zoomedInFromHutHighlight) this.zoomOut()
      this.zoomedInFromHutHighlight = false
      this.showHighlight = false
      return
    }

    this.highlightedHut = this.hutjes.filter((item) => item.hutNr == hutNr)[0]
    if (!this.highlightedHut) {
      this.hutNotFound = true
      return
    }
    this.showHighlight = true
    let coords = this.coordinatesInMetersFromTopLeft(this.highlightedHut.location.latitude, this.highlightedHut.location.longitude)
    let rect = this.canvas.canvas.getBoundingClientRect()
    this.zoomIn(coords.x / this.mapWidth * rect.width / (this.zoomedIn ? this.zoomFactor : 1), coords.y / this.mapHeight * rect.height / (this.zoomedIn ? this.zoomFactor : 1))
    this.zoomedInFromHutHighlight = true
    this.updateHighlightIndicator()
  }

  updateHighlightIndicator() {
    if (!this.showHighlight || !this.highlightedHut) return;
    let hutSize = this.highlightedHut.size || this.defaultSize
    let coords = this.coordinatesInMetersFromTopLeft(this.highlightedHut.location.latitude, this.highlightedHut.location.longitude)
    let x = (this.zoomedIn ? 0 : hutSize / (2 * this.mapSize.w)) + coords.x / this.mapWidth
    let y = (this.zoomedIn ? 0 : hutSize / (2 * this.mapSize.h)) + coords.y / this.mapHeight
    this.hutIndicatorLeft = 'calc(' + (100 * x).toFixed(2) + '% - ' + (this.zoomedIn ? 5 : 14) + 'px)'
    this.hutIndicatorTop = 'calc(' + (100 * y).toFixed(2) + '% -  ' + (this.zoomedIn ? 5 : 14) + 'px)'
  }

  updateLocIndicator(data, self) {
    this.foundLocation = true
    let coords = self.coordinatesInMetersFromTopLeft(data['coords'].latitude, data['coords'].longitude)
    if(coords.x < 0 || coords.x > self.mapWidth || coords.y < 0 || coords.y > self.mapWidth) {
      self.foundLocation = false
      return
    }
    self.foundLocation = true
    self.locIndicatorLeft = 'calc(' + (100 * coords.x / self.mapWidth).toFixed(2) + '% - 14px)'
    self.locIndicatorTop = 'calc(' + (100 * coords.y / self.mapHeight).toFixed(2) + '% - 14px)'
    if (self.isSavingLocation && !self.hasZoomedInToLocation && !self.zoomedIn && +new Date() < self.pageOpenTime + 1000) {
      let rect = self.canvas.canvas.getBoundingClientRect()
      self.zoomIn(coords.x / this.mapWidth * rect.width, coords.y / this.mapHeight * rect.height)
      self.hasZoomedInToLocation = true
    }
  }

  zoomClick(event) {
    this.zoomedInFromHutHighlight = false
    let rect = document.getElementById("zoomable").getBoundingClientRect()
    let x = event.pageX - rect.left
    let y = event.pageY - rect.top
    if (this.zoomedIn) {
      let cvw = this.canvas.canvas.getBoundingClientRect().width / (this.zoomFactor ** 2)
      let cvh = this.canvas.canvas.getBoundingClientRect().height / (this.zoomFactor ** 2)
      x /= this.zoomFactor
      x += this.currentZoomX - cvw / 2
      y /= this.zoomFactor
      y += this.currentZoomY - cvh / 2
    }
    if (this.zoomedIn && !this.isSavingLocation) this.zoomOut()
    else {
      if (this.isSavingLocation) {
        this.hasSelectedLocation = true
        let lat = this.topLeftLat - y / rect.height * (this.topLeftLat - this.bottomRightLat)
        let lng = this.topLeftLng + x / rect.width * (this.bottomRightLng - this.topLeftLng)
        this.selectedLocation = new Parse.GeoPoint(lat, lng)
        this.selectionHighlightLeft = 'calc(' + (100 * x / rect.width) + '% - 8px)'
        this.selectionHighlightTop = 'calc(' + (100 * y / rect.height) + '% - 16px)'
      }
      this.zoomIn(x, y)
    }
  }

  zoomOut() {
    this.zoomedIn = false
    this.zoomLeft = '0px'
    this.zoomTop = '0px'
    this.updateHighlightIndicator()
  }

  zoomIn(zoomX, zoomY) {
    let canvasWidth = this.canvas.canvas.getBoundingClientRect().width / (this.zoomedIn ? this.zoomFactor : 1)
    let canvasHeight = this.canvas.canvas.getBoundingClientRect().height / (this.zoomedIn ? this.zoomFactor : 1)
    if (zoomX > canvasWidth || zoomY > canvasHeight || zoomX < 0 || zoomY < 0) return
    this.zoomLeft = this.zoomFactor * (canvasWidth / 2 - zoomX) + 'px'
    this.zoomTop = this.zoomFactor * (canvasHeight / 2 - zoomY) + 'px'
    this.zoomedIn = true
    this.currentZoomX = zoomX
    this.currentZoomY = zoomY
    this.updateHighlightIndicator()
  }

  closeModal() {
    this.showModal = false;
    let self = this
    setTimeout(function () {
      self.showModalHigh = false
    }, 400);
  }

  async dontShowAgain() {
    await this.storage.set('dontShowLocationModalAgain', true)
    this.closeModal()
  }

  async saveLocation() {
    let result = await this.g.apiCall('saveHutLocation', {
      hutNr: this.hutNr,
      lat: this.selectedLocation.latitude,
      lng: this.selectedLocation.longitude
    })

    if (result.response == 'success') {
      if (this.savingFromButton) {
        this.hutNr = ''
        this.isSavingLocation = false
        this.savingFromButton = false
        this.hasSelectedLocation = false
        this.zoomOut()
      } else {
        this.g.hutLocationChangeStatus = 'success'
        this.navCtrl.pop({ animate: true, animation: "ios-transition", direction: 'back' })
        let self = this;
        setTimeout(function () {
          self.g.hutLocationChangeStatus = 'done'
        }, 2000)
      }
    } else {
      alert(result.response)
    }
  }
  startEditing() {
    if (!this.hutNr || this.hutNr.length < 3) return
    this.isSavingLocation = true
    this.savingFromButton = true
  }

  refreshData() {
    this.isRefreshing = true;
    this.updateData();
  }

  ngOnDestroy() {
    if (this.g.hutLocationChangeStatus == 'loading') this.g.hutLocationChangeStatus = ''
    if (this.locationSubscription) this.locationSubscription.unsubscribe();
    if(this.locUpdateInterval) clearInterval(this.locUpdateInterval)
  }
}
