import { readFile, writeFile } from 'fs';
import xml from 'xml2js'
import axios from 'axios'

const someFile = './config.xml';

readFile(someFile, 'utf8', function(err, data) {
	if (err) {
		// eslint-disable-next-line no-console
		return console.log(err);
	}

	xml.parseString(data, function (err, result) {
		let versionNr = result.widget.$.version.replace(/\./g,'')

		axios({
			method: 'get',
			url: 'https://api.appcenter.ms/v0.1/apps/shoogland/TimmerdorpHeilooIos/releases?published_only=true',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'x-api-token': process.env.APP_CENTER_TOKEN
			}
		}).then((result)=>{
			let build = 1
			if(result.data[0].version.indexOf(versionNr) === 0){
				build = parseInt(result.data[0].version.replace(versionNr,''))
				build++
			}
			let configFile = data.replace(/BUILDNR/g, versionNr + build);

			writeFile(someFile, configFile, 'utf8', function(err) {
				// eslint-disable-next-line no-console
				if (err) return console.log(err);
			});
		})
	});
});
