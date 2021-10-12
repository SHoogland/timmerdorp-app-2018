import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";

import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
  statistieken: object;

  title: string;
  error: string;
  wijk: string;

  showChildCountGraph: boolean;
  isRefreshing: boolean;
  loadingWijk: boolean;
  loadingGraphData: boolean;
  loginError: boolean;

  eventListener: any;
  wijkprops: any;
  allprops: any;
  admins: any;
  wijken: any;

  constructor(
    public navCtrl: NavController,
    public storage: Storage,
    public g: GlobalFunctions
  ) {
    this.error = '';
    this.admins = [];

    this.wijkprops = [
      {
        title: "Totaal aantal kinderen",
        prop: "count"
      },
      {
        title: "Aanwezig di",
        prop: "aanwezig_di"
      },
      {
        title: "Aanwezig wo",
        prop: "aanwezig_wo"
      },
      {
        title: "Aanwezig do",
        prop: "aanwezig_do"
      },
      {
        title: "Aanwezig vr",
        prop: "aanwezig_vr"
      }
    ];

    this.allprops = [
      {
        title: "Totaal aantal kinderen",
        prop: "count"
      },
      {
        title: "Aantal kinderen met hutnummer",
        prop: "haveHutnr"
      },
      {
        title: "Aantal kinderen met armbandje",
        prop: "haveWristband"
      },
    ];

    this.wijken = []
  }

  async ngAfterViewInit() {
    this.wijk = (await this.storage.get('wijk')) || 'blue';
    this.wijken = ['yellow', 'red', 'blue', 'green', 'hutlozen'].sort((w) => (this.wijk === w ? -1 : 1))
    this.title = 'Statistieken';
    this.updateData();


    let self = this;
    document.querySelector('div.sticky-fab i.material-icons').addEventListener('animationiteration', function () {
      if (!(self.loadingWijk || self.loadingGraphData)) self.isRefreshing = false;
    })
  }

  async updateData() {
    this.loadingWijk = true;
    this.loadingGraphData = true;

    let self = this;
    this.g.apiCall('wijkStats').then((result) => {
      if (!result || result.response !== 'success') {
        return;
      }

      self.statistieken = result;

      self.admins = result.adminList.sort(function (a, b) {
        return b.total - a.total
      }).filter(function (a) {
        return a.total
      })

      self.loadingWijk = false;
    });

    let result = await this.g.apiCall('getPresencesByTime')
    this.parseGraphData(result)
  }

  parseGraphData(result) {
    if (result.response !== 'success') return
    let entries = result.entries
    if (!entries.length) {
      this.showChildCountGraph = false
      return
    }

    this.showChildCountGraph = true
    entries = entries.sort((a, b) => (a.hour != b.hour ? a.hour - b.hour : a.minute - b.minute))

    let isConsecutive = (a, b) => a.minute === 59 ? ((b.hour == a.hour + 1) && b.minute === 0) : (a.hour === b.hour && b.minute === a.minute + 1)

    // if i.e. there is only an entry for 11:22 and 11:24, also fill them up to have 11:23 (with the same amount as 11:22)
    for (let i = 0; i < entries.length - 1; i++) {
      if (!isConsecutive(entries[i], entries[i + 1])) {
        let newEntry = {
          hour: entries[i].hour,
          minute: entries[i].minute + 1,
          total: entries[i].total,
          yellow: entries[i].yellow,
          red: entries[i].red,
          blue: entries[i].blue,
          green: entries[i].green,
        }
        if (+entries[i].minute === 59) {
          newEntry.hour = entries[i].hour + 1
          newEntry.minute = 0
        }
        entries.splice(i + 1, 0, newEntry) // voeg nieuwe entry toe aan entries
      }
    }



    // Apply chart themes
    am4core.useTheme(am4themes_animated);
    am4core.useTheme(am4themes_kelly);

    // Create chart instance
    var chart = am4core.create("presencesByTimeChart", am4charts.XYChart);

    chart.marginRight = 400;
    let data = []
    let prependZero = (x) => (x < 10 ? '0' + x : x)

    for (let i = 0; i < entries.length; i++) {
      if (i === 0) {
        let m = entries[i].minute - 1
        let h = entries[i].hour
        if (entries[i].minute === 0) {
          h--
          m = 59
        }
        data.push({
          t: prependZero(h) + ':' + prependZero(m),
          v: 0,
          y: 0,
          r: 0,
          b: 0,
          g: 0,
        })
      }
      data.push({
        t: prependZero(entries[i].hour) + ':' + prependZero(entries[i].minute),
        v: entries[i].total,
        y: entries[i].yellow,
        r: entries[i].red,
        b: entries[i].blue,
        g: entries[i].green,
      })
    }

    if(result.currentTime) {
      let i = data.length - 1
      data.push({
        t: result.currentTime,
        v: data[i].v,
        y: data[i].y,
        r: data[i].r,
        b: data[i].b,
        g: data[i].g,
      })
    }

    chart.data = data

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "t";
    categoryAxis.title.text = "Tijdstip";

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Aantal kindjes";

    let seriesList = [
      {
        name: 'Geel',
        key: 'y',
        color: '#fce700',
      },
      {
        name: 'Rood',
        key: 'r',
        color: '#ee0202',
      },
      {
        name: 'Blauw',
        key: 'b',
        color: '#2196f3',
      },
      {
        name: 'Groen',
        key: 'g',
        color: '#43a047',
      }
    ]

    for (let i = 0; i < seriesList.length; i++) {
      let series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = seriesList[i].key;
      series.dataFields.categoryX = "t";
      series.name = "Wijk " + seriesList[i].name;
      series.stroke = am4core.color(seriesList[i].color)
      series.fill = am4core.color(seriesList[i].color)
      series.fillOpacity = 0.4;
      series.strokeWidth = 2;
      series.stacked = true;
      series.tensionX = 0.8
      series.tensionY = 1
    }

    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "v";
    series.stroke = am4core.color('#000')
    series.dataFields.categoryX = "t";
    series.name = "Totaal aantal kindjes";
    series.strokeWidth = 3;
    series.tensionX = 0.8
    series.tensionY = 1

    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";


    this.loadingGraphData = false
  }

  refreshData() {
    this.isRefreshing = true;
    this.updateData();
  }
}
