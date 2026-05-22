const express = require('express');
const router = express.Router();
const trustGraphService = require('../services/trustGraphService');

/**
 * GET /api/trust-graph
 * Computes trust ranks using PageRank and returns graph nodes and edges
 */
router.get('/', async (req, res) => {
  try {
    const graphData = await trustGraphService.buildTrustGraph();
    const { trustScores, iterations } = await trustGraphService.computeTrustScores();

    // Attach computed scores to nodes
    const enrichedNodes = graphData.nodes.map(node => {
      const scores = trustScores[node.id] || {};
      return {
        ...node,
        computed_centrality: scores.graph_centrality || 0,
        computed_trust: scores.graph_trust || 70,
        computed_authenticity: scores.graph_authenticity || undefined
      };
    });

    res.json({
      success: true,
      iterations,
      nodes: enrichedNodes,
      links: graphData.links
    });
  } catch (error) {
    console.error('Error fetching trust graph:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to compute trust graph',
      error: error.message
    });
  }
});

module.exports = router;
