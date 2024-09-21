// module.exports = {
//     createNode: (source, target, node_id) => ({
//         _id: node_id,
//         type: 'node',
//         node_id,
//         source,
//         target
//         // created_at: Date.now(),
//         // modified_at: Date.now()
//     }),
//     // Other utility methods for nodes if needed
// };

const nano = require('nano')('http://admin:pass@localhost:5984');
const nodesDb = nano.db.use('nodes'); // Database name: nodes

// Helper function to create a new node
exports.createNode = (node_id) => {
    return {
        _id: node_id,
        // source: source,
        // target: target,
        created_at: Date.now(),
        modified_at: Date.now()
    };
};

exports.nodesDb = nodesDb;
