import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    nav: {
      home: 'Home',
      match: 'Find Match',
      influencers: 'Influencers',
      graph: 'Trust Network',
      langToggle: 'বাংলা'
    },
    home: {
      heroTitle1: 'Match Brands with',
      heroTitle2: 'Perfect Creators',
      heroSubtitle: 'AI-powered influencer matching engine for Bangladeshi brands. Score compatibility, assess trust, and get AI-driven campaign strategies.',
      startBtn: 'Start Matching →',
      browseBtn: 'Browse Influencers',
      trackmartech: 'BuildFest 2026 — Track 2: MarTech',
      feature1Title: 'Smart Matching',
      feature1Desc: 'AI-scored compatibility between brands and creators based on niche, audience, and trust metrics.',
      feature2Title: 'Deep Analytics',
      feature2Desc: 'Engagement rates, CPM analysis, audience demographics, and authenticity scoring.',
      feature3Title: 'AI Strategy',
      feature3Desc: 'Claude-powered campaign strategy and collaboration recommendations for your brand.',
      feature4Title: 'Graph Intelligence',
      feature4Desc: 'Trust score engine using graph-based credibility across platforms and past campaigns.',
      ctaTitle: 'Ready to find your perfect creator?',
      ctaSubtitle: 'Fill in your brand profile and get AI-ranked matches in seconds.',
      ctaBtn: 'Launch Matching Engine →'
    },
    match: {
      title: 'Influencer Matching',
      subtitle: 'Define your brand profile and discover your ideal creators.',
      brandInfo: 'Brand Info',
      brandName: 'Brand Name *',
      brandNamePl: 'e.g. Shajgoj',
      industry: 'Industry',
      industryPl: 'e.g. Beauty & Cosmetics',
      goal: 'Campaign Goal',
      goalPl: 'e.g. Product launch awareness',
      audience: 'Target Audience',
      gender: 'Gender',
      genderAll: 'All',
      genderFemale: 'Female',
      genderMale: 'Male',
      ageGroup: 'Age Group',
      followers: 'Follower Range',
      minFollowers: 'Min Followers',
      maxFollowers: 'Max Followers',
      budget: 'Budget per Post (৳)',
      niches: 'Niches *',
      platforms: 'Platforms',
      aiAnalysis: 'AI Analysis',
      aiToggle: 'Enable AI Campaign Analysis',
      aiDesc: 'Uses Claude API to generate strategic recommendations (requires API key).',
      requiredError: 'Brand name and at least one niche are required.',
      submitBtn: 'Find Matching Influencers →',
      loadingText: 'Scoring influencers...',
      readyTitle: 'Ready to Match',
      readyDesc: 'Fill in your brand profile and click "Find Matching Influencers"',
      summaryFound: '{count} matches found for {brand}',
      aiStrategyTitle: '🤖 AI Campaign Strategy',
      tipsTitle: 'Collaboration Tips',
      contentTypesTitle: 'Content Types',
      estReach: 'Est. Reach: ',
      scoreBreakdown: 'Score Breakdown',
      excellentMatch: 'Excellent Match',
      goodMatch: 'Good Match',
      fairMatch: 'Fair Match',
      lowMatch: 'Low Match'
    },
    influencers: {
      title: 'Influencer Database',
      subtitle: 'Browse and filter all registered influencers.',
      allPlatforms: 'All Platforms',
      filterNiche: 'Filter by niche...',
      minEngagement: 'Min engagement %',
      applyFilters: 'Apply Filters',
      followers: 'Followers',
      engagement: 'Engagement',
      trust: 'Trust',
      authenticity: 'Authenticity',
      cpm: 'Avg CPM: ',
      rate: 'Rate: ',
      ratePerPost: 'per post',
      ratePerVideo: 'per video',
      bio: 'Bio',
      pastBrands: 'Past Collaborations',
      contentFormats: 'Content Formats',
      cpmLabel: 'CPM',
      likesLabel: 'Avg Likes',
      backBtn: '← Back to Influencers',
      perfRadar: 'Performance Radar',
      ageDist: 'Audience Age Distribution',
      audienceGender: '♀ {female}% Female · ♂ {male}% Male',
      syncBtn: 'Sync Social Stats 🔄',
      syncing: 'Syncing...',
      verified: 'Verified',
      trustScoreCard: 'Graph Trust Score',
      detailsTitle: 'Influencer Details'
    },
    graph: {
      title: 'Trust Centrality Network',
      subtitle: 'Mathematical visualization of MarTech trust relationships using PageRank. Dynamic weights represent collaboration history and peer endorsements.',
      iterations: 'Solved in {count} PageRank iterations',
      brandNodes: 'Brands (Outbound Trust)',
      hubNodes: 'Niche Hubs',
      influencerNodes: 'Influencers (PageRank Receiver)',
      endorseLink: 'Endorsement',
      collabLink: 'Brand Collaboration',
      audienceLink: 'Audience Overlap',
      targetsLink: 'Niche Alignment',
      detailsHeader: 'Selected Node Details',
      clickNodePrompt: 'Click on any node in the network to inspect its structural connections and computed centrality.',
      rankLabel: 'Computed PageRank Weight:',
      trustLabel: 'blended Trust Score:',
      typeLabel: 'Node Type:'
    },
    sync: {
      title: 'Live Social Sync Terminal',
      closeBtn: 'Close & Refresh UI',
      running: 'API Handshake in progress...',
      success: 'Sync pipeline completed successfully!'
    }
  },
  bn: {
    nav: {
      home: 'হোম',
      match: 'ম্যাচ খুঁজুন',
      influencers: 'ইনফ্লুয়েন্সার্স',
      graph: 'ট্রাস্ট নেটওয়ার্ক',
      langToggle: 'English'
    },
    home: {
      heroTitle1: 'ব্র্যান্ডের সাথে মেলান',
      heroTitle2: 'নিখুঁত ক্রিয়েটর',
      heroSubtitle: 'বাংলাদেশী ব্র্যান্ডগুলোর জন্য এআই-চালিত ইনফ্লুয়েন্সার ম্যাচিং ইঞ্জিন। সামঞ্জস্য পরিমাপ করুন, বিশ্বাসযোগ্যতা যাচাই করুন এবং এআই-ভিত্তিক প্রচারণা কৌশল পান।',
      startBtn: 'ম্যাচিং শুরু করুন →',
      browseBtn: 'ইনফ্লুয়েন্সার্স ব্রাউজ করুন',
      trackmartech: 'বিল্ডফেস্ট ২০২৬ — ট্র্যাক ২: মারটেক',
      feature1Title: 'স্মার্ট ম্যাচিং',
      feature1Desc: 'বিষয়শ্রেণী, দর্শক এবং ট্রাস্ট মেকানিজমের উপর ভিত্তি করে ব্র্যান্ড ও ক্রিয়েটরদের মধ্যে এআই-চালিত সামঞ্জস্যতা পরিমাপ।',
      feature2Title: 'গভীর বিশ্লেষণ',
      feature2Desc: 'এনগেজমেন্ট রেট, সিপিএম বিশ্লেষণ, দর্শকদের জনসংখ্যাতত্ত্ব এবং সত্যতা পরিমাপের স্কোর।',
      feature3Title: 'এআই কৌশল',
      feature3Desc: 'ক্লোড (Claude) এআই-চালিত প্রচারণা পরিকল্পনা এবং ব্র্যান্ডের জন্য সহযোগিতা সুপারিশসমূহ।',
      feature4Title: 'গ্রাফ ইন্টেলিজেন্স',
      feature4Desc: 'বিভিন্ন প্ল্যাটফর্ম এবং অতীতের প্রচারণার ডেটা বিশ্লেষণ করে গ্রাফ-ভিত্তিক ট্রাস্ট স্কোর ইঞ্জিন।',
      ctaTitle: 'আপনার নিখুঁত ক্রিয়েটর খুঁজতে প্রস্তুত?',
      ctaSubtitle: 'আপনার ব্র্যান্ডের প্রোফাইল পূরণ করুন এবং মুহূর্তেই এআই-র‍্যাংকড ম্যাচিং ফলাফল পান।',
      ctaBtn: 'ম্যাচিং ইঞ্জিন চালু করুন →'
    },
    match: {
      title: 'ইনফ্লুয়েন্সার ম্যাচিং',
      subtitle: 'আপনার ব্র্যান্ডের প্রোফাইল তৈরি করুন এবং নিখুঁত ক্রিয়েটরদের আবিষ্কার করুন।',
      brandInfo: 'ব্র্যান্ডের তথ্য',
      brandName: 'ব্র্যান্ডের নাম *',
      brandNamePl: 'যেমন: সাজগোজ',
      industry: 'শিল্প/সেক্টর',
      industryPl: 'যেমন: বিউটি ও কসমেটিকস',
      goal: 'প্রচারণার লক্ষ্য',
      goalPl: 'যেমন: নতুন প্রোডাক্ট লঞ্চ সচেতনতা',
      audience: 'টার্গেট অডিয়েন্স',
      gender: 'লিঙ্গ',
      genderAll: 'সবাই',
      genderFemale: 'নারী',
      genderMale: 'পুরুষ',
      ageGroup: 'বয়স গ্রুপ',
      followers: 'ফলোয়ার পরিসীমা',
      minFollowers: 'সর্বনিম্ন ফলোয়ার',
      maxFollowers: 'সর্বোচ্চ ফলোয়ার',
      budget: 'পোস্ট প্রতি বাজেট (৳)',
      niches: 'বিষয়শ্রেণী (Niches) *',
      platforms: 'প্ল্যাটফর্মসমূহ',
      aiAnalysis: 'এআই বিশ্লেষণ',
      aiToggle: 'এআই প্রচারণা বিশ্লেষণ সক্রিয় করুন',
      aiDesc: 'কৌশলগত সুপারিশ তৈরি করতে ক্লোড এআই (Claude API) ব্যবহার করে (এপিআই কি প্রয়োজন)।',
      requiredError: 'ব্র্যান্ডের নাম এবং কমপক্ষে একটি বিষয়শ্রেণী নির্বাচন করা আবশ্যক।',
      submitBtn: 'ম্যাচিং ইনফ্লুয়েন্সার্স খুঁজুন →',
      loadingText: 'ইনফ্লুয়েন্সারদের সামঞ্জস্যতা পরিমাপ করা হচ্ছে...',
      readyTitle: 'ম্যাচিংয়ের জন্য প্রস্তুত',
      readyDesc: 'আপনার ব্র্যান্ড প্রোফাইল পূরণ করে "ম্যাচিং ইনফ্লুয়েন্সার্স খুঁজুন" বাটনে ক্লিক করুন',
      summaryFound: '{brand} এর জন্য {count} টি ম্যাচিং পাওয়া গেছে',
      aiStrategyTitle: '🤖 এআই প্রচারণা কৌশল',
      tipsTitle: 'সহযোগিতার পরামর্শসমূহ',
      contentTypesTitle: 'কনটেন্ট প্রকারসমূহ',
      estReach: 'সম্ভাব্য রিচ: ',
      scoreBreakdown: 'স্কোর বিশ্লেষণ',
      excellentMatch: 'অসাধারণ ম্যাচ',
      goodMatch: 'ভালো ম্যাচ',
      fairMatch: 'মোটামুটি ম্যাচ',
      lowMatch: 'কম ম্যাচ'
    },
    influencers: {
      title: 'ইনফ্লুয়েন্সার ডাটাবেজ',
      subtitle: 'নিবন্ধিত সকল ইনফ্লুয়েন্সার ব্রাউজ এবং ফিল্টার করুন।',
      allPlatforms: 'সকল প্ল্যাটফর্ম',
      filterNiche: 'বিষয়শ্রেণী দিয়ে ফিল্টার...',
      minEngagement: 'সর্বনিম্ন এনগেজমেন্ট %',
      applyFilters: 'ফিল্টার প্রয়োগ করুন',
      followers: 'ফলোয়ারস',
      engagement: 'এনগেজমেন্ট',
      trust: 'ট্রাস্ট',
      authenticity: 'অথেনটিসিটি',
      cpm: 'গড় সিপিএম: ',
      rate: 'রেট: ',
      ratePerPost: 'পোস্ট প্রতি',
      ratePerVideo: 'ভিডিও প্রতি',
      bio: 'বায়ো',
      pastBrands: 'অতীতের কোলাবোরেশনসমূহ',
      contentFormats: 'কনটেন্ট ফরম্যাটসমূহ',
      cpmLabel: 'সিপিএম',
      likesLabel: 'গড় লাইক',
      backBtn: '← ইনফ্লুয়েন্সার্স তালিকায় ফিরুন',
      perfRadar: 'পারফরম্যান্স রাডার',
      ageDist: 'দর্শকদের বয়সের বণ্টন',
      audienceGender: '♀ {female}% নারী · ♂ {male}% পুরুষ',
      syncBtn: 'সোশ্যাল স্ট্যাটাস সিঙ্ক করুন 🔄',
      syncing: 'সিঙ্ক হচ্ছে...',
      verified: 'ভেরিফায়েড',
      trustScoreCard: 'গ্রাফ ট্রাস্ট স্কোর',
      detailsTitle: 'ইনফ্লুয়েন্সার বিবরণ'
    },
    graph: {
      title: 'ট্রাস্ট সেন্ট্রালিটি নেটওয়ার্ক',
      subtitle: 'পেজর‍্যাঙ্ক অ্যালগরিদম ব্যবহার করে মারটেক ট্রাস্ট সম্পর্কসমূহের গাণিতিক ভিজ্যুয়ালাইজেশন। ডাইনামিক ওজন কোলাবোরেশনের ইতিহাস এবং সহকর্মী ইনফ্লুয়েন্সারদের স্বীকৃতি প্রকাশ করে।',
      iterations: '{count} টি পেজর‍্যাঙ্ক ইটারেশনে সমাধান করা হয়েছে',
      brandNodes: 'ব্র্যান্ডস (আউটবাউন্ড ট্রাস্ট)',
      hubNodes: 'বিষয়শ্রেণী হাবসমূহ',
      influencerNodes: 'ইনফ্লুয়েন্সার্স (পেজর‍্যাঙ্ক গ্রাহক)',
      endorseLink: 'স্বীকৃতি/এন্ডোর্সমেন্ট',
      collabLink: 'ব্র্যান্ড কোলাবোরেশন',
      audienceLink: 'দর্শকদের ওভারল্যাপ',
      targetsLink: 'বিষয়শ্রেণী সামঞ্জস্য',
      detailsHeader: 'নির্বাচিত নোডের বিবরণ',
      clickNodePrompt: 'নেটওয়ার্কের সংযোগ এবং পেজর‍্যাঙ্ক সেন্ট্রালিটি দেখতে যেকোনো নোডে ক্লিক করুন।',
      rankLabel: 'Computed পেজর‍্যাঙ্ক ওজন:',
      trustLabel: 'মিশ্রিত ট্রাস্ট স্কোর:',
      typeLabel: 'নোডের ধরণ:'
    },
    sync: {
      title: 'লাইভ সোশ্যাল সিঙ্ক টার্মিনাল',
      closeBtn: 'বন্ধ করুন ও উইন্ডো রিফ্রেশ করুন',
      running: 'এপিআই হ্যান্ডশেক চলছে...',
      success: 'সিঙ্ক পাইপলাইন সফলভাবে সম্পন্ন হয়েছে!'
    }
  }
};

const banglaDigits = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('influence_iq_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('influence_iq_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[language];
    
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        return path; // fallback to path string
      }
    }
    return result;
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '';
    const str = num.toLocaleString();
    if (language === 'en') return str;
    
    // Convert digits to Bangla digits
    return str.replace(/[0-9]/g, w => banglaDigits[w] || w);
  };

  const translateWithParams = (path, params) => {
    let str = t(path);
    Object.keys(params).forEach(key => {
      const val = language === 'bn' && typeof params[key] === 'number'
        ? formatNumber(params[key])
        : params[key];
      str = str.replace(`{${key}}`, val);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, formatNumber, translateWithParams }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}
