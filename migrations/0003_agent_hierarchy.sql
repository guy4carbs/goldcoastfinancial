-- Agent Hierarchy Table
-- Tracks organizational structure and upline/downline relationships

CREATE TABLE IF NOT EXISTS agent_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  direct_upline_id UUID REFERENCES users(id),

  -- Position in hierarchy (0=owner, 1=executive, 2=regional director, 3=team lead, 4=senior agent, 5=agent, 6=new agent)
  hierarchy_level INTEGER NOT NULL DEFAULT 5,
  hierarchy_title VARCHAR(100),

  -- Full upline chain for quick lookups (array of user IDs from direct upline to owner)
  upline_chain JSONB DEFAULT '[]',

  -- Override commission settings
  override_eligible BOOLEAN DEFAULT false,
  override_percentage DECIMAL(5, 2),

  -- Effective dates (for historical tracking)
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_hierarchy_agent_user_id ON agent_hierarchy(agent_user_id);
CREATE INDEX IF NOT EXISTS idx_hierarchy_direct_upline_id ON agent_hierarchy(direct_upline_id);
CREATE INDEX IF NOT EXISTS idx_hierarchy_level ON agent_hierarchy(hierarchy_level);

-- Insert sample hierarchy data for demo (optional - comment out for production)
-- This creates a sample hierarchy with the demo agent account

-- Note: In production, you would seed this data via an admin interface or script
-- The structure assumes existing users in the database
