-- Add updated_at column to project_images table
ALTER TABLE project_images
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create a trigger function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_project_images_updated_at
    BEFORE UPDATE ON project_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing rows to have the current timestamp
UPDATE project_images
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- Add comment to explain the column's purpose
COMMENT ON COLUMN project_images.updated_at IS 'Timestamp of when the record was last updated'; 