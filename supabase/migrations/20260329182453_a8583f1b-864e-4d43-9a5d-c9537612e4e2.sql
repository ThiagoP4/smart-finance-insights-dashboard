
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  cpf text DEFAULT '',
  monthly_balance numeric DEFAULT 0,
  avatar_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Couples table
CREATE TABLE public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  invite_email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'dissolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own couples" ON public.couples
  FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create couple" ON public.couples
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update own couples" ON public.couples
  FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Helper function to get couple_id for a user
CREATE OR REPLACE FUNCTION public.get_couple_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.couples
  WHERE (user1_id = _user_id OR user2_id = _user_id) AND status = 'active'
  LIMIT 1;
$$;

-- Categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  name text NOT NULL,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or couple categories" ON public.categories
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR couple_id = public.get_couple_id(auth.uid())
  );

CREATE POLICY "Users can insert categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.get_couple_id(auth.uid()));

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Cards table
CREATE TABLE public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  name text NOT NULL,
  last_digits text NOT NULL DEFAULT '0000',
  closing_day integer NOT NULL DEFAULT 1,
  due_day integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or couple cards" ON public.cards
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.get_couple_id(auth.uid()));

CREATE POLICY "Users can insert cards" ON public.cards
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.get_couple_id(auth.uid()));

CREATE POLICY "Users can delete own cards" ON public.cards
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Purchases table
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'others',
  date date NOT NULL DEFAULT CURRENT_DATE,
  card_id uuid REFERENCES public.cards(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or couple purchases" ON public.purchases
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.get_couple_id(auth.uid()));

CREATE POLICY "Users can insert purchases" ON public.purchases
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own purchases" ON public.purchases
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.get_couple_id(auth.uid()));

CREATE POLICY "Users can delete own purchases" ON public.purchases
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Incomes table
CREATE TABLE public.incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'salary',
  date date NOT NULL DEFAULT CURRENT_DATE,
  recurring boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or couple incomes" ON public.incomes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.get_couple_id(auth.uid()));

CREATE POLICY "Users can insert incomes" ON public.incomes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own incomes" ON public.incomes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR couple_id = public.get_couple_id(auth.uid()));

CREATE POLICY "Users can delete own incomes" ON public.incomes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Enable realtime for shared tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incomes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couples;
