/**
 * Score-based matching algorithm and free local campaign strategy generator.
 *
 * The scoring engine stays deterministic so the project can run and deploy
 * without paid AI APIs. Live social data is handled separately by the free
 * YouTube Data API integration in socialApiService.js.
 */

function scoreInfluencerForBrand(influencer, brandProfile) {
  let score = 0;
  const breakdown = {};

  // 1. Niche alignment (30 pts)
  const nicheMatch = influencer.niche.filter(n =>
    brandProfile.niches.some(bn =>
      n.toLowerCase().includes(bn.toLowerCase()) ||
      bn.toLowerCase().includes(n.toLowerCase())
    )
  ).length;
  const nicheScore = Math.min(30, (nicheMatch / Math.max(brandProfile.niches.length, 1)) * 30);
  breakdown.niche = Math.round(nicheScore);
  score += nicheScore;

  // 2. Audience demographics match (20 pts)
  let demoScore = 0;
  if (brandProfile.targetGender === 'female' && influencer.audience_demographics.gender_female >= 60) demoScore += 10;
  if (brandProfile.targetGender === 'male' && influencer.audience_demographics.gender_male >= 60) demoScore += 10;
  if (brandProfile.targetGender === 'all') demoScore += 8;

  const ageScore = brandProfile.targetAgeGroup === '18-24'
    ? influencer.audience_demographics.age_18_24 / 10
    : brandProfile.targetAgeGroup === '25-34'
    ? influencer.audience_demographics.age_25_34 / 10
    : influencer.audience_demographics.age_35_44 / 10;
  demoScore += Math.min(10, ageScore);
  breakdown.demographics = Math.min(20, Math.round(demoScore));
  score += breakdown.demographics;

  // 3. Follower range fit (15 pts)
  const { minFollowers = 0, maxFollowers = Infinity } = brandProfile;
  if (influencer.followers >= minFollowers && influencer.followers <= maxFollowers) {
    breakdown.followerRange = 15;
    score += 15;
  } else {
    breakdown.followerRange = 5;
    score += 5;
  }

  // 4. Engagement rate (15 pts)
  const engScore = Math.min(15, influencer.engagement_rate * 2.5);
  breakdown.engagement = Math.round(engScore);
  score += engScore;

  // 5. Trust & Authenticity (10 pts each = 20 pts total)
  const trustScore = (influencer.trust_score / 100) * 10;
  const authScore = (influencer.authenticity_score / 100) * 10;
  breakdown.trust = Math.round(trustScore);
  breakdown.authenticity = Math.round(authScore);
  score += trustScore + authScore;

  return {
    ...influencer,
    match_score: Math.round(score),
    score_breakdown: breakdown,
    match_label: score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Fair Match' : 'Low Match'
  };
}

function matchInfluencers(brandProfile, influencerList) {
  const platformFiltered = Array.isArray(brandProfile.platforms) && brandProfile.platforms.length > 0
    ? influencerList.filter(inf => brandProfile.platforms.includes(inf.platform))
    : influencerList;

  const scored = platformFiltered.map(inf => scoreInfluencerForBrand(inf, brandProfile));
  return scored.sort((a, b) => b.match_score - a.match_score);
}

function sumFollowers(influencers) {
  return influencers.reduce((total, inf) => total + (Number(inf.followers) || 0), 0);
}

function formatReach(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M potential impressions`;
  if (value >= 1000) return `${Math.round(value / 1000)}K potential impressions`;
  return `${value} potential impressions`;
}

function uniqueContentTypes(influencers) {
  const contentTypes = influencers.flatMap(inf => inf.content_types || []);
  return [...new Set(contentTypes)].slice(0, 5);
}

/**
 * Free local campaign analysis. It mirrors the old AI response shape without
 * calling a paid model provider, which keeps demos deployable on free tiers.
 */
async function generateAIAnalysis(brandProfile, topMatches) {
  const topThree = topMatches.slice(0, 3);
  const topPick = topThree[0];
  const primaryNiche = brandProfile.niches?.[0] || 'brand';
  const platforms = [...new Set(topThree.map(inf => inf.platform))].join(', ') || 'mixed platforms';
  const reach = Math.round(sumFollowers(topThree) * 0.32);

  if (!topPick) {
    return {
      campaign_strategy: 'No eligible creators matched the current filters. Broaden the platform, follower range, or niche filters and rerun the matcher.',
      top_pick_reasoning: 'No top pick is available for the current campaign profile.',
      collaboration_tips: ['Expand follower range', 'Try adjacent niches', 'Allow more than one platform'],
      risk_flags: ['No creators matched the selected constraints'],
      estimated_reach: 'N/A',
      recommended_content_types: ['Posts', 'Short Videos']
    };
  }

  const highTrust = topPick.trust_score >= 90 && topPick.authenticity_score >= 90;
  const contentTypes = uniqueContentTypes(topThree);

  return {
    campaign_strategy: `Run a ${primaryNiche.toLowerCase()} campaign across ${platforms}, starting with the highest scoring creator and retargeting their engaged audience with the next two matches. Prioritize creator-led proof, short-form hooks, and localized Bangla copy to convert trust into measurable traffic.`,
    top_pick_reasoning: `${topPick.name} leads because the profile combines ${topPick.match_score}/100 match strength, ${topPick.engagement_rate}% engagement, and strong audience fit for ${brandProfile.targetGender || 'all'} ${brandProfile.targetAgeGroup || '18-34'} consumers.`,
    collaboration_tips: [
      `Brief ${topPick.name} with one clear campaign promise and room for native creator voice.`,
      `Use ${contentTypes[0] || 'short videos'} for reach, then follow with ${contentTypes[1] || 'stories'} for conversion prompts.`,
      'Track coupon codes, UTM links, and comment sentiment separately for each creator.'
    ],
    risk_flags: highTrust
      ? []
      : ['Review recent comments and sponsored post history before final contracting.'],
    estimated_reach: formatReach(reach),
    recommended_content_types: contentTypes.length > 0 ? contentTypes : ['Posts', 'Stories', 'Short Videos']
  };
}

module.exports = { matchInfluencers, generateAIAnalysis };
