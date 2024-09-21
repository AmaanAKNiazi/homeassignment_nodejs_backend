const { edgesDb } = require('../db/couchdb');
const { createEdge } = require('../models/edgeModel');
const { createResponse } = require('../utils/responseHelper');

exports.saveEdge = async (req, res) => {
    const { source, target, edge_id } = req.body.request.data.edge;

    const newEdge = createEdge(source, target, edge_id);

    try {
        const response = await edgesDb.insert(newEdge);
        res.json(createResponse(200, 'OK', '', { edge_id: response.id }));
        //const response = await edgesDb.get(edge_id);
        //res.json(createResponse(200, 'OK', '', { edge: response }));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.updateEdge = async (req, res) => {
    const { edge_id, source, target} = req.body.request.data.edge;

    try {
        // Fetch the existing edge by edge_id
        const existingEdge = await edgesDb.get(edge_id);

        // Update the edge's fields
        existingEdge.source = source || existingEdge.source;
        existingEdge.target = target || existingEdge.target;
        existingEdge.modified_at = Date.now();

        // Save the updated edge back to CouchDB
        const updatedEdge = await edgesDb.insert(existingEdge);

        const response = await edgesDb.get(edge_id);
        res.json(createResponse(200, 'OK', '', { edge: response }));

    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.deleteEdge = async (req, res) => {
    const { edge_id } = req.body.request.data.edge;

    try {
        // Fetch the existing edge by edge_id
        const existingEdge = await edgesDb.get(edge_id);

        // Delete the edge from CouchDB using _id and _rev
        const deleteResponse = await edgesDb.destroy(existingEdge._id, existingEdge._rev);

        res.json(createResponse(200, 'OK', 'Edge deleted successfully', {}));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.getConnectedNodes = async (req, res) => {
    const nodeId = req.body.request.data.node_id; // node_id sent in the request

    try {
        // Query the view using the node_id as the key
        const result = await edgesDb.view('edgesDesignDoc', 'getEdgeByNode', {
            keys: [nodeId],  // Query the node_id in both source and target
            include_docs: true
        });

        const edgeObjects = result.rows.map(row => row.doc);  // Extract the documents

        // Extract connected nodes from the edges
        const connectedNodes = edgeObjects.map(edge => ({
            edge_id: edge.edge_id,
            source: edge.source,
            target: edge.target
        }));

        // Prepare the response with the list of connected nodes
        const responseJO = {
            data: {
                edges: connectedNodes
            }
        };

        res.json(createResponse(200, 'OK', '', responseJO));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.getAllEdgesWithNodes = async (req, res) => {
    try {
        // Query the view to get all nodes with 'node_id'
        const result = await edgesDb.view('edgesDesignDoc', 'getEdgesWithNodes', { include_docs: true });

        // Extract the node documents
        const edgeObjects = result.rows.map(row => row.doc);

        const edgesArr = edgeObjects.map(edge => ({
            edge_id: edge.edge_id,
            source: edge.source,
            target: edge.target,
            label: edge.label
        }));

        // Prepare the response with the list of node objects
        const responseJO = {
            data: {
                edges: edgesArr
            }
        };

        res.json(createResponse(200, 'OK', '', responseJO));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.getAllEdges = async (req, res) => {
    try {
        // Query the view to get all nodes with 'node_id'
        const result = await edgesDb.view('edgesDesignDoc', 'getEdgesWithNodes', { include_docs: true });

        // Extract the node documents
        const edgeObjects = result.rows.map(row => row.id);

        // const edgesArr = edgeObjects.map(edge => ({
        //     edge_id: edge.edge_id
        // }));

        // Prepare the response with the list of node objects
        const responseJO = {
            data: {
                edges: edgeObjects
            }
        };

        res.json(createResponse(200, 'OK', '', responseJO));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};