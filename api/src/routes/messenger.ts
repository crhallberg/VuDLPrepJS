import SolrIndexer from '../services/SolrIndexer';

var express = require('express');
var router = express.Router();

router.get("/solrindex/:pid", async function(req, res, next) {
    try {
        var indexer = new SolrIndexer();
        var fedoraFields = await indexer.getFields(req.params.pid);
        res.json(fedoraFields);
    } catch (e) {
        console.error(e.message);
        res.status(500).send(e.message);
    }
});

module.exports = router;
