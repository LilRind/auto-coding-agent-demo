-- Custom types
CREATE TYPE project_stage AS ENUM ('draft', 'scenes', 'images', 'videos', 'completed');
CREATE TYPE image_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE video_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'realistic',
  stage project_stage NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  description TEXT NOT NULL,
  description_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  image_status image_status NOT NULL DEFAULT 'pending',
  image_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  video_status video_status NOT NULL DEFAULT 'pending',
  video_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  duration DECIMAL(10, 2),
  task_id TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_order_index ON scenes(order_index);
CREATE INDEX IF NOT EXISTS idx_images_scene_id ON images(scene_id);
CREATE INDEX IF NOT EXISTS idx_videos_scene_id ON videos(scene_id);
CREATE INDEX IF NOT EXISTS idx_videos_task_id ON videos(task_id);
CREATE INDEX IF NOT EXISTS idx_scenes_image_status ON scenes(image_status);
CREATE INDEX IF NOT EXISTS idx_scenes_video_status ON scenes(video_status);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated at trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scenes
CREATE POLICY "Users can view scenes in their projects" ON scenes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can insert scenes in their projects" ON scenes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can update scenes in their projects" ON scenes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can delete scenes in their projects" ON scenes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );

-- RLS Policies for images
CREATE POLICY "Users can view images in their projects" ON images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = images.scene_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images in their projects" ON images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = images.scene_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images in their projects" ON images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = images.scene_id AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for videos
CREATE POLICY "Users can view videos in their projects" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = videos.scene_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert videos in their projects" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = videos.scene_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update videos in their projects" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = videos.scene_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete videos in their projects" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM scenes
      JOIN projects ON projects.id = scenes.project_id
      WHERE scenes.id = videos.scene_id AND projects.user_id = auth.uid()
    )
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload files to their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view files in their folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete files in their folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
