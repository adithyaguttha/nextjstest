-- Ensure all necessary columns exist in the projects table
DO $$ 
BEGIN
    -- Add possession_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'possession_status') THEN
        ALTER TABLE projects ADD COLUMN possession_status VARCHAR(50);
    END IF;

    -- Add price_range if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'price_range') THEN
        ALTER TABLE projects ADD COLUMN price_range JSONB;
    END IF;

    -- Add is_active if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'is_active') THEN
        ALTER TABLE projects ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- Add created_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'created_at') THEN
        ALTER TABLE projects ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add created_by if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'created_by') THEN
        ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add cover_image_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'cover_image_url') THEN
        ALTER TABLE projects ADD COLUMN cover_image_url TEXT;
    END IF;

    -- Add brochure_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'brochure_url') THEN
        ALTER TABLE projects ADD COLUMN brochure_url TEXT;
    END IF;
END $$;

-- Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to explain the columns
COMMENT ON COLUMN projects.possession_status IS 'Current status of the project (e.g., Ready to Move, Under Construction)';
COMMENT ON COLUMN projects.price_range IS 'JSON object containing min, max, and currency of the project price range';
COMMENT ON COLUMN projects.is_active IS 'Whether the project is currently active in the system';
COMMENT ON COLUMN projects.created_at IS 'Timestamp when the project was created';
COMMENT ON COLUMN projects.updated_at IS 'Timestamp when the project was last updated';
COMMENT ON COLUMN projects.created_by IS 'User ID of the person who created the project';
COMMENT ON COLUMN projects.cover_image_url IS 'URL of the project cover image';
COMMENT ON COLUMN projects.brochure_url IS 'URL of the project brochure PDF';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_possession_status ON projects(possession_status); 