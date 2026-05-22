create table if not exists influencers (
  id text primary key,
  name text not null,
  handle text not null,
  platform text not null,
  niche text[] not null default '{}',
  followers bigint not null default 0,
  engagement_rate numeric not null default 0,
  avg_likes bigint not null default 0,
  avg_comments bigint not null default 0,
  location text,
  language text[] not null default '{}',
  audience_demographics jsonb not null default '{}',
  past_brands text[] not null default '{}',
  authenticity_score integer not null default 0,
  trust_score integer not null default 0,
  content_types text[] not null default '{}',
  avg_cpm numeric not null default 0,
  collaboration_rate text,
  verified boolean not null default false,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id text primary key,
  brandName text not null,
  industry text,
  campaignGoal text,
  niches text[] not null default '{}',
  targetGender text,
  targetAgeGroup text,
  minFollowers bigint,
  maxFollowers bigint,
  budgetPerPost numeric,
  platforms text[] not null default '{}',
  useAI boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists influencers_platform_idx on influencers (platform);
create index if not exists influencers_followers_idx on influencers (followers);
create index if not exists influencers_engagement_idx on influencers (engagement_rate);
create index if not exists influencers_niche_gin_idx on influencers using gin (niche);
