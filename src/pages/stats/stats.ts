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

  isRefreshing: boolean;
  loginError: boolean;
  loading: boolean;

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
    this.init();
    this.loading = false;
    this.error = '';
    this.admins = [];
    this.isRefreshing = false;

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

  async init() {
    this.wijk = (await this.storage.get('wijk')) || 'blue';
    this.wijken = ['yellow', 'red', 'blue', 'green', 'hutlozen'].sort((w) => (this.wijk === w ? -1 : 1))
    this.title = 'Statistieken';
    this.updateData();


    let self = this;
    document.querySelector('div.sticky-fab i.material-icons').addEventListener('animationiteration', function () {
      if (!self.loading) self.isRefreshing = false;
    })
  }

  updateData() {
    this.loading = true;

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

      self.loading = false;
    });

    this.g.apiCall('getPresencesByTime', { day: 'wed' }).then((result) => {
      if (result.response !== 'success') return
      let entries = result.entries

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
        data.push({
          t: prependZero(entries[i].hour) + ':' + prependZero(entries[i].minute),
          v: entries[i].total
        })
      }

      chart.data = data

      // Create axes
      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "t";
      categoryAxis.title.text = "Tijdstip";
      categoryAxis.renderer.grid.template.location = 0;


      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = "Aantal kindjes";

      // Create series
      var series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = "v";
      series.dataFields.categoryX = "t";
      series.name = "Aantal kindjes";
      series.tooltipText = "{name}: [bold]{valueY}[/]";
    })
  }

  refreshData() {
    this.isRefreshing = true;
    this.updateData();
  }
}
