-- Add is_featured column to projects table
ALTER TABLE projects
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster queries on featured projects
CREATE INDEX idx_projects_is_featured ON projects(is_featured);

-- Add comment to explain the column
COMMENT ON COLUMN projects.is_featured IS 'Indicates whether the project should be featured on the homepage and listings page'; 