-- Drop existing constraint if it exists
ALTER TABLE project_images DROP CONSTRAINT IF EXISTS valid_image_type;

-- Add constraint to ensure category is one of the allowed values
ALTER TABLE project_images
ADD CONSTRAINT valid_image_type
CHECK (category IN (
  'Elevation',
  'Bedroom',
  'Kitchen',
  'Living Area',
  'Dining Area',
  'Amenities',
  'Floor Plan',
  'Location Plan',
  'Construction Status',
  'Others'
));

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT valid_image_type ON project_images IS 'Ensures that image categories are one of the predefined valid values'; 