-- Rename image_type column to category in project_images table
ALTER TABLE project_images 
RENAME COLUMN image_type TO category;

-- Add comment to explain the column
COMMENT ON COLUMN project_images.category IS 'Category of the project image (e.g., Elevation, Bedroom, Kitchen, etc.)';

-- Add an index for faster category-based queries
CREATE INDEX idx_project_images_category ON project_images(category); 