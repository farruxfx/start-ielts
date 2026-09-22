CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  target_band DECIMAL(3,1) DEFAULT 7.5,
  exam_date DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking', 'mock')),
  overall_band DECIMAL(3,1) NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT,
  example TEXT,
  synonyms TEXT[],
  word_family JSONB,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  mastery_level INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  your_answer TEXT,
  correct_answer TEXT,
  explanation TEXT,
  category TEXT,
  difficulty TEXT,
  skill TEXT,
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT DEFAULT 'free' CHECK (status IN ('free', 'active', 'expired', 'cancelled', 'pending_payment', 'trial')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_id TEXT
);

CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  plan_id TEXT NOT NULL,
  payment_method_id TEXT,
  base_amount INTEGER NOT NULL,
  exact_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'failed')),
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  transaction_message_id TEXT,
  transaction_sender_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  current_section TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  section_scores JSONB,
  overall_band DECIMAL(3,1)
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  listening BOOLEAN DEFAULT FALSE,
  reading BOOLEAN DEFAULT FALSE,
  writing BOOLEAN DEFAULT FALSE,
  speaking BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_skill ON test_results(skill);
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary_words(user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_user_id ON mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_sessions_user_id ON mock_exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own results" ON test_results;
DROP POLICY IF EXISTS "Users can insert own results" ON test_results;
CREATE POLICY "Users can view own results" ON test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own vocabulary" ON vocabulary_words;
DROP POLICY IF EXISTS "Users can manage own vocabulary" ON vocabulary_words;
CREATE POLICY "Users can view own vocabulary" ON vocabulary_words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vocabulary" ON vocabulary_words FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own mistakes" ON mistakes;
DROP POLICY IF EXISTS "Users can manage own mistakes" ON mistakes;
CREATE POLICY "Users can view own mistakes" ON mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mistakes" ON mistakes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own orders" ON payment_orders;
CREATE POLICY "Users can view own orders" ON payment_orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own mock sessions" ON mock_exam_sessions;
DROP POLICY IF EXISTS "Users can manage own mock sessions" ON mock_exam_sessions;
CREATE POLICY "Users can view own mock sessions" ON mock_exam_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mock sessions" ON mock_exam_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can manage own achievements" ON achievements;
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own daily goals" ON daily_goals;
DROP POLICY IF EXISTS "Users can manage own daily goals" ON daily_goals;
CREATE POLICY "Users can view own daily goals" ON daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily goals" ON daily_goals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_payment_orders_updated_at ON payment_orders;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON payment_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Student'),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
