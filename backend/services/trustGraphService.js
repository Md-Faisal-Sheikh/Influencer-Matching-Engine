const dbService = require('./dbService');

/**
 * Builds the social trust graph representing nodes (influencers, brands, hubs)
 * and links (collaborations, endorsements, audience overlap).
 */
async function buildTrustGraph() {
  const influencers = await dbService.getInfluencers();
  const brands = await dbService.getBrands();

  const nodes = [];
  const links = [];
  
  // 1. Add Niche Hub Nodes (Category Aggregators)
  const hubs = [
    { id: 'hub_tech', name: 'Tech & Cybersecurity', type: 'hub', group: 1 },
    { id: 'hub_beauty', name: 'Beauty & Fashion', type: 'hub', group: 2 },
    { id: 'hub_food', name: 'Food & Travel', type: 'hub', group: 3 },
    { id: 'hub_wellness', name: 'Health & Wellness', type: 'hub', group: 4 }
  ];
  hubs.forEach(h => nodes.push(h));

  // Helper to resolve niche to hub
  const getHubId = (niches) => {
    if (niches.some(n => ['Tech', 'Gadgets', 'Cybersecurity', 'Education'].includes(n))) return 'hub_tech';
    if (niches.some(n => ['Beauty', 'Fashion', 'Sustainability'].includes(n))) return 'hub_beauty';
    if (niches.some(n => ['Food', 'Travel', 'Culture'].includes(n))) return 'hub_food';
    if (niches.some(n => ['Health', 'Fitness', 'Wellness'].includes(n))) return 'hub_wellness';
    return 'hub_tech'; // default
  };

  // 2. Add Influencer Nodes
  influencers.forEach(inf => {
    nodes.push({
      id: inf.id,
      name: inf.name,
      handle: inf.handle,
      type: 'influencer',
      platform: inf.platform,
      followers: inf.followers,
      group: inf.platform === 'Instagram' ? 5 : inf.platform === 'YouTube' ? 6 : 7,
      base_trust: inf.trust_score,
      base_authenticity: inf.authenticity_score
    });

    // Link Influencer to Niche Hub
    const hubId = getHubId(inf.niche);
    links.push({
      source: inf.id,
      target: hubId,
      type: 'TARGETS',
      weight: 1.5
    });
  });

  // 3. Add Brand Nodes
  // Collect unique brands from past collaborations
  const pastBrandNames = new Set();
  influencers.forEach(inf => {
    inf.past_brands.forEach(b => pastBrandNames.add(b));
  });
  // Also add dynamically saved brands
  brands.forEach(b => pastBrandNames.add(b.brandName));

  Array.from(pastBrandNames).forEach(bName => {
    nodes.push({
      id: `brand_${bName.toLowerCase().replace(/\s+/g, '_')}`,
      name: bName,
      type: 'brand',
      group: 8
    });
  });

  // 4. Create Collaboration Edges
  influencers.forEach(inf => {
    inf.past_brands.forEach(bName => {
      const brandId = `brand_${bName.toLowerCase().replace(/\s+/g, '_')}`;
      // Add directed edge from Brand to Influencer (Brand delegates trust by working with them)
      links.push({
        source: brandId,
        target: inf.id,
        type: 'COLLABORATED_WITH',
        weight: 2.0
      });
    });
  });

  // 5. Create Peer-to-Peer Endorsement Edges
  // Establish realistic endorsements based on niches
  const peerEndorsements = [
    { from: 'inf_001', to: 'inf_005', weight: 1.5 }, // Farhan tech -> Mamun Cyber
    { from: 'inf_005', to: 'inf_001', weight: 1.5 }, // Mamun Cyber -> Farhan tech
    { from: 'inf_002', to: 'inf_004', weight: 1.2 }, // Nusrat Beauty -> Anika Fashion
    { from: 'inf_004', to: 'inf_002', weight: 1.2 }, // Anika Fashion -> Nusrat Beauty
    { from: 'inf_006', to: 'inf_002', weight: 1.0 }, // Sadia Wellness -> Nusrat
    { from: 'inf_003', to: 'inf_001', weight: 1.0 }  // Rakib Food -> Farhan Tech
  ];

  peerEndorsements.forEach(pe => {
    // Only add if both exist
    if (influencers.some(i => i.id === pe.from) && influencers.some(i => i.id === pe.to)) {
      links.push({
        source: pe.from,
        target: pe.to,
        type: 'ENDORSES',
        weight: pe.weight
      });
    }
  });

  // 6. Audience Overlap Edges (Cross-Influencer)
  // Shared audience base overlap (undirected or bi-directional)
  const sharedAudienceOverlaps = [
    { nodeA: 'inf_001', nodeB: 'inf_005', value: 0.4 }, // Tech overlap
    { nodeA: 'inf_002', nodeB: 'inf_004', value: 0.35 } // Fashion overlap
  ];

  sharedAudienceOverlaps.forEach(sa => {
    links.push(
      { source: sa.nodeA, target: sa.nodeB, type: 'SHARED_AUDIENCE', weight: sa.value },
      { source: sa.nodeB, target: sa.nodeA, type: 'SHARED_AUDIENCE', weight: sa.value }
    );
  });

  return { nodes, links };
}

/**
 * Computes Graph Trust Scores using a pure-JS PageRank solver.
 */
async function computeTrustScores() {
  const { nodes, links } = await buildTrustGraph();
  const N = nodes.length;
  const d = 0.85; // Damping factor
  const maxIterations = 30;
  const tolerance = 0.0001;

  // Initialize PageRank equally
  const ranks = {};
  nodes.forEach(node => {
    ranks[node.id] = 1.0 / N;
  });

  // Build adjacency representation
  const outDegree = {};
  const inboundLinks = {};
  
  nodes.forEach(node => {
    outDegree[node.id] = 0;
    inboundLinks[node.id] = [];
  });

  links.forEach(link => {
    // source points to target, which means target receives rank from source
    const src = link.source;
    const tgt = link.target;
    
    if (outDegree[src] !== undefined) {
      outDegree[src] += 1;
    }
    if (inboundLinks[tgt] !== undefined) {
      inboundLinks[tgt].push({ source: src, weight: link.weight || 1.0 });
    }
  });

  // Solve PageRank iteratively
  let converged = false;
  let iteration = 0;

  while (iteration < maxIterations && !converged) {
    const nextRanks = {};
    let diff = 0;
    
    // Account for sink nodes (nodes with 0 out-degree) by accumulating their rank
    let sinkSum = 0;
    nodes.forEach(node => {
      if (outDegree[node.id] === 0) {
        sinkSum += ranks[node.id];
      }
    });

    nodes.forEach(node => {
      let rankSum = 0;

      // Inbound rank from node's predecessors
      inboundLinks[node.id].forEach(inLink => {
        const pre = inLink.source;
        // Distribute rank weighted by link weight
        const divisor = outDegree[pre] || 1;
        rankSum += (ranks[pre] / divisor) * inLink.weight;
      });

      // Distribute sink node ranks equally to all nodes
      rankSum += sinkSum / N;

      // PageRank equation
      nextRanks[node.id] = ((1.0 - d) / N) + (d * rankSum);
      diff += Math.abs(nextRanks[node.id] - ranks[node.id]);
    });

    // Update ranks
    nodes.forEach(node => {
      ranks[node.id] = nextRanks[node.id];
    });

    if (diff < tolerance) {
      converged = true;
    }
    iteration++;
  }

  // Normalize scores to a scale of 0 to 100
  const maxRank = Math.max(...Object.values(ranks));
  const minRank = Math.min(...Object.values(ranks));
  const rankRange = maxRank - minRank || 1.0;

  const trustScores = {};
  nodes.forEach(node => {
    // Normalize and scale to a dynamic range 45 - 99 based on baseline scores
    let normalized = (ranks[node.id] - minRank) / rankRange;
    // Map to realistic scoring range
    let finalGraphScore = Math.round(45 + normalized * 54);
    
    // If it's an influencer, mix PageRank with their base authenticity to get highly robust credibility!
    if (node.type === 'influencer') {
      const blendedTrust = Math.round(finalGraphScore * 0.4 + node.base_trust * 0.6);
      const blendedAuth = Math.round(finalGraphScore * 0.3 + node.base_authenticity * 0.7);
      trustScores[node.id] = {
        graph_centrality: parseFloat(ranks[node.id].toFixed(4)),
        graph_trust: blendedTrust,
        graph_authenticity: blendedAuth
      };
    } else {
      trustScores[node.id] = {
        graph_centrality: parseFloat(ranks[node.id].toFixed(4)),
        graph_trust: finalGraphScore
      };
    }
  });

  return { trustScores, rawRanks: ranks, iterations: iteration };
}

module.exports = {
  buildTrustGraph,
  computeTrustScores
};
