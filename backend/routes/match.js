const express = require('express');
const router = express.Router();
const { matchInfluencers, generateAIAnalysis } = require('../services/matchingService');
const dbService = require('../services/dbService');

/**
 * POST /api/match
 * Body: brand profile object
 * Returns ranked influencers + AI analysis
 */
router.post('/', async (req, res) => {
  const {
    brandName,
    industry,
    campaignGoal,
    niches,
    targetGender,
    targetAgeGroup,
    minFollowers,
    maxFollowers,
    budgetPerPost,
    platforms,
    useAI = false
  } = req.body;

  // Validate required fields
  if (!brandName || !niches || !Array.isArray(niches) || niches.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'brandName and niches array are required'
    });
  }

  const brandProfile = {
    brandName,
    industry,
    campaignGoal,
    niches,
    targetGender: targetGender || 'all',
    targetAgeGroup: targetAgeGroup || '18-34',
    minFollowers: minFollowers || 0,
    maxFollowers: maxFollowers || Infinity,
    budgetPerPost,
    platforms
  };

  try {
    const influencerList = await dbService.getInfluencers();
    const rankedInfluencers = matchInfluencers(brandProfile, influencerList);

    let aiAnalysis = null;
    if (useAI && rankedInfluencers.length > 0) {
      aiAnalysis = await generateAIAnalysis(brandProfile, rankedInfluencers);
    }

    res.json({
      success: true,
      brand: brandProfile,
      total_matches: rankedInfluencers.length,
      matches: rankedInfluencers,
      ai_analysis: aiAnalysis
    });
  } catch (error) {
    console.error('Error during influencer matching:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;

