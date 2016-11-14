# feelingAnalysisSMCaen
Second part of crawlerSMCaen project (search engine and feeling monitoring) : [`First part of the project`](https://github.com/lcouellan/crawlerSMCaen/)
The analysis is focused on suporter feeling of the soccer team Stade Malherbe de Caen.

It's a group project involving Lénaïc Couellan and Pierre Labadille, students in M2-DNR2i from the University of Caen.

## Installing

Clone the repository (localy or in node server)
```
git clone https://github.com/plabadille/feelingAnalysisSMCaen.git
cd feelingAnalysisSMCaen
```

Rename the file "config_template.json" to "config.json" and fill it with your MongoDb id (locate in: /config/)

Run installDependencies.sh to install dependencies
```
chmod +x installDependencies.sh
sudo ./installDependencies.sh
```

## Fill the database 

Fill the database with the dump directory.

```
mongorestore --host localhost --port 37017 --db yourDatabase dump/
```

## Launch the application

Update your node installation and start the server.
```
cd server
npm i
node server.js
```

## Built with

* [`NodeJs`](https://nodejs.org)
* [`MongoDb`](https://www.mongodb.com/fr)

## License

This project is licensed under the GNU License - see the [LICENCE](LICENSE) file for details
