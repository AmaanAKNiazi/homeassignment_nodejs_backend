const express = require('express');
const { saveEdge, updateEdge, deleteEdge, getConnectedNodes, getAllEdgesWithNodes, getAllEdges } = require('../controllers/edgeController');

const router = express.Router();

router.post('/edge', (req, res) => {
    const method = req.body.request.method;

    if (method === 'saveEdge') {
        saveEdge(req, res);
    }  
    else if (method === 'updateEdge') {
        updateEdge(req, res);
    } 
    else if (method === 'deleteEdge') {
        deleteEdge(req, res);
    }
    else if (method === 'getConnectedNodes') {
        getConnectedNodes(req, res);
    }
    else if (method === 'getAllEdgesWithNodes') {
        getAllEdgesWithNodes(req, res);
    } 
    else if (method === 'getAllEdges') {
        getAllEdges(req, res);
    }  else {
        res.status(400).json({ message: 'Invalid method' }); // Handle invalid method requests
    }
});

module.exports = router;
