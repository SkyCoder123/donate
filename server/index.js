const express = require('express');
const bodyParser = require('body-parser');
const config = require('../lib/config');
const keys = require('./keys');
const handleStripe = require('./paymentHandlers/stripe');
const { amazonConfirm } = require('./paymentHandlers/amazon');

const port = config.port || 8080;

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('*', (req, res, next) => {
  console.log(req.originalUrl)
  next();
})

function isProductionRoute(route) {
  return isProduction ? route : `/api${route}`;
}

app.get(isProductionRoute('/stripe-key'), (req, res) => {
  res.json({ key: keys.stripe.public });
});

app.get(isProductionRoute('/amazon-key'), (req, res) => {
  res.json({
    keys: {
      merchant: keys.amazon.merchant,
      public: keys.amazon.public }
    });
});

app.post(isProductionRoute('/confirm-amazon'), amazonConfirm);
app.post(isProductionRoute('/charge-stripe'), handleStripe);

app.listen(port, () => {
  console.log(`donate-api started on :${port}`);
});
