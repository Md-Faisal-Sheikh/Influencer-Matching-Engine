const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const socialApiService = require('../services/socialApiService');

// GET all influencers (with optional filters)
router.get('/', async (req, res) => {
  const { platform, niche, minFollowers, maxFollowers, minEngagement } = req.query;

  try {
    const results = await dbService.getInfluencers({
      platform,
      niche,
      minFollowers,
      maxFollowers,
      minEngagement
    });
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Error fetching influencers:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET single influencer by ID
router.get('/:id', async (req, res) => {
  try {
    const influencer = await dbService.getInfluencerById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    // Attach computed PageRank trust scores to the influencer
    try {
      const trustGraphService = require('../services/trustGraphService');
      const { trustScores } = await trustGraphService.computeTrustScores();
      const scores = trustScores[influencer.id];
      if (scores) {
        influencer.graph_centrality = scores.graph_centrality;
        influencer.graph_trust = scores.graph_trust;
        influencer.graph_authenticity = scores.graph_authenticity;
      }
    } catch (graphError) {
      console.error('Error computing graph scores for single influencer:', graphError.message);
    }

    res.json({ success: true, data: influencer });
  } catch (error) {
    console.error('Error fetching influencer by ID:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST sync influencer by ID
router.post('/:id/sync', async (req, res) => {
  try {
    const result = await socialApiService.syncSocialStats(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error synchronizing influencer:', error.message);
    if (error.message === 'Influencer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to synchronize live social statistics' });
  }
});

module.exports = router;

