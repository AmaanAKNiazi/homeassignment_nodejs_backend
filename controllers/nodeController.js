const { nodesDb } = require('../db/couchdb');
const { edgesDb } = require('../db/couchdb');
const { createNode } = require('../models/nodeModel');
const { createResponse } = require('../utils/responseHelper');

exports.saveNode = async (req, res) => {
    //const { source, target, node_id } = req.body.request.data.node;

    //const newNode = createNode(source, target, node_id);
    //const newNode = createNode( node_id);


    const node = req.body.request.data.node;
    node["_id"] = node.node_id;
    node["created_at"] = Date.now();
    node["modified_at"] = Date.now();


    // const newNode = req.body.request.data.node.map(node => ({
    //     _id: node.node_id,
    //     node_id: node.node_id,
    //     label: node.label,
    //     ["created_at"] : Date.now(),
    //     ["modified_at"]: Date.now()
    // }))

    try {
        const response = await nodesDb.insert(node);
        res.json(createResponse(200, 'OK', '', { node_id: response.id }));
        //const response = await nodesDb.get(node_id);
        //res.json(createResponse(200, 'OK', '', { node: response }));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.updateNode = async (req, res) => {
    const { node_id, source, target} = req.body.request.data.node;

    try {
        // Fetch the existing node by node_id
        const existingNode = await nodesDb.get(node_id);

        // Update the node's fields
        existingNode.source = source || existingNode.source;
        existingNode.target = target || existingNode.target;
        existingNode.modified_at = Date.now();

        // Save the updated node back to CouchDB
        const updatedNode = await nodesDb.insert(existingNode);

        const response = await nodesDb.get(node_id);
        res.json(createResponse(200, 'OK', '', { node: response }));

        //res.json(createResponse(200, 'OK', '', { node: updatedNode }));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.deleteNode = async (req, res) => {
    const { node_id } = req.body.request.data.node;

    try {
        // Fetch the existing node by node_id
        const existingNode = await nodesDb.get(node_id);

        // Delete the node from CouchDB using _id and _rev
        const deleteResponse = await nodesDb.destroy(existingNode._id, existingNode._rev);

        res.json(createResponse(200, 'OK', 'Node deleted successfully', {}));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};


// exports.updateNode = async (req, res) => {
//     logger.info('NodeManagement: updateNode');

//     const responseJO = {};
//     try {
//         // CouchDbHandler equivalent
//         const node = req.body.request.data.node;

//         // Fetch existing node by ID
//         const savedNode = await nodesDb.get(node.id);
        
//         // Add the _rev field to the request's node object
//         node._rev = savedNode._rev;

//         // Update the document in CouchDB
//         const updatedNodeResponse = await nodesDb.insert(node);

//         // Prepare the response
//         responseJO.data = {};
//         responseJO.data.node = updatedNodeResponse.id;

//         // Return success response
//         const response = createResponse(200, 'OK', '', responseJO);
//         res.json(response);

//     } catch (error) {
//         logger.error('Error processing request: ' + JSON.stringify(req.body));
//         logger.error(error.message || error.toString(), error);

//         // Prepare the error response
//         const response = createResponse(500, error.message || error.toString(), responseJO);
//         res.json(response);
//     }
// };

exports.getAllNodeIds = async (req, res) => {
    //logger.info('NodeManagement: getAllNodeIds');

    const responseJO = {};
    try {
        // Query the custom view to get node IDs
        const result = await nodesDb.view('nodesDesignDoc', 'getNodeIds', { include_docs: false });

        // Extract all the IDs from the result
        const nodeIds = result.rows.map(row => row.id);

        // Prepare the response
        responseJO.data = {};
        responseJO.data.node_ids = nodeIds;

        // Return success response
        const response = createResponse(200, 'OK', '', responseJO);
        res.json(response);

    } catch (error) {
        //logger.error('Error fetching node IDs: ' + error.message || error.toString(), error);

        // Prepare the error response
        const response = createResponse(500, error.message || error.toString(), responseJO);
        res.json(response);
    }
};


exports.getAllNodesWithNodeId = async (req, res) => {
    try {
        // Query the view to get all nodes with 'node_id'
        const result = await nodesDb.view('nodesDesignDoc', 'getNodesWithIds', { include_docs: true });

        // Extract the node documents
        const nodeObjects = result.rows.map(row => row.doc);

        const nodesArr = nodeObjects.map(edge => ({
            node_id: edge.node_id,
            label: edge.label
        }));
        // Prepare the response with the list of node objects
        const responseJO = {
            data: {
                nodes: nodesArr
            }
        };

        res.json(createResponse(200, 'OK', '', responseJO));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};

exports.calculatePageRankForNode = async (req, res) => {
    const { node_id } = req.body.request.data;

    if (!node_id) {
        return res.json(createResponse(400, 'Bad Request', 'node_id is required'));
    }

    try {
        // Call the PageRank calculation function
        const pageRank = await calculatePageRank(node_id, nodesDb, edgesDb);

        // Prepare the response
        const responseJO = {
            data: {
                node_id,
                page_rank: pageRank.toString()
            }
        };

        res.json(createResponse(200, 'OK', '', responseJO));
    } catch (error) {
        res.json(createResponse(500, 'Error', error.message));
    }
};


const calculatePageRank = async (nodeId, nodesDb, edgesDb, maxIterations = 100, dampingFactor = 0.85) => {
    try {
        // Step 1: Fetch all edges (relationships between nodes)
        const edgesResult = await edgesDb.find({
            selector: {
                type: 'edge',
                "$or": [
                    { source: nodeId },
                    { target: nodeId }
                ]
            }
        });
        const edges = edgesResult.docs;

        // Step 2: Build a graph structure for PageRank calculation
        let graph = {};
        edges.forEach(edge => {
            if (!graph[edge.source]) {
                graph[edge.source] = { out: [], in: [] };
            }
            if (!graph[edge.target]) {
                graph[edge.target] = { out: [], in: [] };
            }

            graph[edge.source].out.push(edge.target);
            graph[edge.target].in.push(edge.source);
        });

        // Step 3: Initialize PageRank values for all nodes
        let pageRanks = {};
        const numNodes = Object.keys(graph).length;
        Object.keys(graph).forEach(node => {
            pageRanks[node] = 1 / numNodes; // Initial rank is 1/N
        });

        // Step 4: Iteratively calculate PageRank
        for (let i = 0; i < maxIterations; i++) {
            let newPageRanks = {};

            Object.keys(graph).forEach(node => {
                let inboundNodes = graph[node].in;
                let rankSum = 0;

                inboundNodes.forEach(inbound => {
                    let outboundLinks = graph[inbound].out.length;
                    if (outboundLinks > 0) {
                        rankSum += pageRanks[inbound] / outboundLinks;
                    }
                });

                newPageRanks[node] = (1 - dampingFactor) / numNodes + dampingFactor * rankSum;
            });

            pageRanks = newPageRanks; // Update pageRanks for the next iteration
        }

        // Step 5: Return the PageRank for the specified node_id
        return pageRanks[nodeId] || 0; // If the node_id is not found, return 0

    } catch (error) {
        throw new Error('Error calculating PageRank: ' + error.message);
    }
};