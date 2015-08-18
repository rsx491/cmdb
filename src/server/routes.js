var router = require('express').Router();
var four0four = require('./utils/404')();


var CMController = require('./controllers/cm.js');

router.get('/cm', CMController.getRecords);
router.get('/cm/tree', CMController.getTree);
router.get('/cm/catalogs', CMController.getCatalogs);
router.get('/cm/:id', CMController.getRecord);
router.post('/cm', CMController.postRecord);

router.get('/*', four0four.notFoundMiddleware);

module.exports = router;


