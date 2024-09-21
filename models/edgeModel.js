// module.exports = {
//     createEdge: (source, target, edge_id) => ({
//         type: 'edge',
//         edge_id,
//         source,
//         target
//     }),
// };


const nano = require('nano')('http://admin:pass@localhost:5984');
const edgesDb = nano.db.use('edges'); // Database name: nodes

// Helper function to create a new node
exports.createEdge = (source, target, edge_id) => {
    return {
        _id: edge_id,
        type: 'edge',
        edge_id,
        source,
        target,
        created_at: Date.now(),
        modified_at: Date.now()
    };
};

exports.edgesDb = edgesDb;