-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  username TEXT UNIQUE,
  writing_streak INTEGER DEFAULT 0,
  last_writing_date DATE,
  total_words_written INTEGER DEFAULT 0
);

-- Drafts table
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_vibe DECIMAL(3,2) CHECK (last_vibe >= -1 AND last_vibe <= 1),
  word_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Vibe history table
CREATE TABLE IF NOT EXISTS public.vibe_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draft_id UUID REFERENCES public.drafts ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  score DECIMAL(3,2) NOT NULL CHECK (score >= -1 AND score <= 1),
  reason TEXT
);

-- Draft versions table
CREATE TABLE IF NOT EXISTS public.draft_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draft_id UUID REFERENCES public.drafts ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  word_count INTEGER DEFAULT 0,
  UNIQUE(draft_id, version_number)
);

-- Writing sessions table
CREATE TABLE IF NOT EXISTS public.writing_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  draft_id UUID REFERENCES public.drafts ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  words_written INTEGER DEFAULT 0,
  average_vibe DECIMAL(3,2),
  flow_duration INTEGER DEFAULT 0 -- in minutes
);

-- Indexes for performance
CREATE INDEX idx_drafts_user_id ON public.drafts(user_id);
CREATE INDEX idx_drafts_updated_at ON public.drafts(updated_at DESC);
CREATE INDEX idx_vibe_history_draft_id ON public.vibe_history(draft_id);
CREATE INDEX idx_draft_versions_draft_id ON public.draft_versions(draft_id);
CREATE INDEX idx_writing_sessions_user_id ON public.writing_sessions(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Drafts policies
CREATE POLICY "Users can view own drafts" ON public.drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own drafts" ON public.drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON public.drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON public.drafts
  FOR DELETE USING (auth.uid() = user_id);

-- Vibe history policies
CREATE POLICY "Users can view own vibe history" ON public.vibe_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drafts 
      WHERE drafts.id = vibe_history.draft_id 
      AND drafts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vibe history" ON public.vibe_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.drafts 
      WHERE drafts.id = vibe_history.draft_id 
      AND drafts.user_id = auth.uid()
    )
  );

-- Draft versions policies
CREATE POLICY "Users can view own draft versions" ON public.draft_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drafts 
      WHERE drafts.id = draft_versions.draft_id 
      AND drafts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own draft versions" ON public.draft_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.drafts 
      WHERE drafts.id = draft_versions.draft_id 
      AND drafts.user_id = auth.uid()
    )
  );

-- Writing sessions policies
CREATE POLICY "Users can view own sessions" ON public.writing_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.writing_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.writing_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 