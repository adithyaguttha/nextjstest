-- Add RERA verification columns to projects table
ALTER TABLE projects
ADD COLUMN rera_verified BOOLEAN DEFAULT false,
ADD COLUMN rera_id VARCHAR(50);

-- Add comment to explain the columns
COMMENT ON COLUMN projects.rera_verified IS 'Indicates whether the project is RERA verified';
COMMENT ON COLUMN projects.rera_id IS 'The RERA registration ID for the project';

-- Add an index for faster RERA ID lookups
CREATE INDEX idx_projects_rera_id ON projects(rera_id); 