-- Create saved_projects table
CREATE TABLE IF NOT EXISTS saved_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, project_id)
);

-- Create seen_projects table
CREATE TABLE IF NOT EXISTS seen_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_enquiries table
CREATE TABLE IF NOT EXISTS project_enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending' NOT NULL,
    developer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_projects_user_id ON saved_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_projects_project_id ON saved_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_seen_projects_user_id ON seen_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_seen_projects_project_id ON seen_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_project_enquiries_user_id ON project_enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_project_enquiries_project_id ON project_enquiries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_enquiries_status ON project_enquiries(status);

-- Enable Row Level Security
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seen_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_enquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Saved projects policies
CREATE POLICY "Users can view their own saved projects"
    ON saved_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save projects"
    ON saved_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own saved projects"
    ON saved_projects FOR DELETE
    USING (auth.uid() = user_id);

-- Seen projects policies
CREATE POLICY "Users can view their own seen projects"
    ON seen_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add seen projects"
    ON seen_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Project enquiries policies
CREATE POLICY "Users can view their own enquiries"
    ON project_enquiries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create enquiries"
    ON project_enquiries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enquiries"
    ON project_enquiries FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for avatars
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    ); 