const express = require('express');
const app = express();
const cors = require('cors');
const compression = require('compression')
const db = require('./models');
// const {user} = require('./models');
const { handler } = require('./utils');
const { errorHandler } = handler;
const Router = require('./routes');
const dotenv = require('dotenv');
  dotenv.config();
  const { PORT } = process.env;
const http_server = require('http')
.createServer(app)
.listen(PORT || 8081);
const amqp = require('amqp');
const connection = amqp.createConnection({ host: 'localhost', port: 5672 });
const started = false;

connection.on('ready', function () {
    if (started === false) {
        started = true;
        connection.exchange('', {confirm: true}, function (exchange) {
            publish(exchange, 1);
        });
    }
});

function publish(exc, i) {
    if (i === 100) {
        return connection.disconnect();
    }
    
    exc.publish('queueName', i, {}, function (err) {
    console.log('Added ' + i);
    setTimeout(function() {
        publish(exc, ++i);
    }, 1);
    });
}




 db.sequelize
     .authenticate()
     .then(async () => {
         console.log('db connect ok');
         await db.sequelize.sync({force : false});
     })
     .catch(err => {
         console.log('db' + err);
    });
    

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(compression());

app.use('/api/send', Router.sendRouter);
app.use('/api/receive', Router.receiveRouter);