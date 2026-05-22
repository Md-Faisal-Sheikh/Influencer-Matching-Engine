const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

/**
 * POST /api/brands
 * Saves a new brand campaign profile
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
    platforms
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
    industry: industry || '',
    campaignGoal: campaignGoal || '',
    niches,
    targetGender: targetGender || 'all',
    targetAgeGroup: targetAgeGroup || '18-34',
    minFollowers: minFollowers ? parseInt(minFollowers) : 0,
    maxFollowers: maxFollowers ? parseInt(maxFollowers) : null,
    budgetPerPost: budgetPerPost ? parseInt(budgetPerPost) : null,
    platforms: platforms || []
  };

  try {
    const saved = await dbService.saveBrand(brandProfile);
    res.status(201).json({
      success: true,
      message: 'Brand profile saved successfully',
      data: saved
    });
  } catch (error) {
    console.error('Error saving brand profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to save brand profile',
      error: error.message
    });
  }
});

/**
 * GET /api/brands
 * Retrieves all brand profiles
 */
router.get('/', async (req, res) => {
  try {
    const brands = await dbService.getBrands();
    res.json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching brand profiles:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand profiles',
      error: error.message
    });
  }
});

module.exports = router;
