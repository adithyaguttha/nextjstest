-- Add video_url column to projects table
ALTER TABLE projects
ADD COLUMN video_url TEXT;

-- Add comment to explain the column's purpose
COMMENT ON COLUMN projects.video_url IS 'YouTube video URL for the project (stored as embed URL)';

-- Create an index for faster video URL lookups
CREATE INDEX idx_projects_video_url ON projects(video_url);

-- Add a check constraint to ensure the URL is a valid YouTube embed URL
ALTER TABLE projects
ADD CONSTRAINT check_video_url_format 
CHECK (video_url IS NULL OR video_url ~ '^https://www\.youtube\.com/embed/[a-zA-Z0-9_-]+$'); 