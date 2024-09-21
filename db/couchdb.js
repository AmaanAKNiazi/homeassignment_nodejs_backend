const Nano = require('nano');
const config = require('../config/couchdbConfig');

const nano = Nano(config.url);

// Connect to different databases
const nodesDb = nano.db.use(config.dbNames.nodesDb);
const edgesDb = nano.db.use(config.dbNames.edgesDb);

module.exports = { nodesDb, edgesDb };
