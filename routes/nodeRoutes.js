const express = require('express');
const { saveNode, updateNode, deleteNode, getAllNodeIds, getAllNodesWithNodeId, calculatePageRankForNode  } = require('../controllers/nodeController');

const router = express.Router();

router.post('/node', (req, res) => {
    const method = req.body.request.method;

    if (method === 'saveNode') {
        saveNode(req, res);
    } 
    else if (method === 'updateNode') {
        updateNode(req, res);
    } 
    else if (method === 'deleteNode') {
        deleteNode(req, res);
    } 
    else if (method === 'getAllNodeIds') {
        getAllNodeIds(req, res);
    }
    else if (method === 'getAllNodesWithNodeId') {
        getAllNodesWithNodeId(req, res);
    }
    else if (method === 'calculatePageRank') {
        calculatePageRankForNode(req, res);
    } else {
        res.status(400).json({ message: 'Invalid method' }); // Handle invalid method requests
    }
});

module.exports = router;
