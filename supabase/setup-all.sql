-- LamaOS production schema (both migrations combined)

CREATE TABLE IF NOT EXISTS public.user_state (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_state TO authenticated;
GRANT ALL ON public.user_state TO service_role;

ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own state" ON public.user_state;
CREATE POLICY "Users can read their own state"
  ON public.user_state FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own state" ON public.user_state;
CREATE POLICY "Users can insert their own state"
  ON public.user_state FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own state" ON public.user_state;
CREATE POLICY "Users can update their own state"
  ON public.user_state FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own state" ON public.user_state;
CREATE POLICY "Users can delete their own state"
  ON public.user_state FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_user_state_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS user_state_set_updated_at ON public.user_state;
CREATE TRIGGER user_state_set_updated_at
  BEFORE UPDATE ON public.user_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_state_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user_state()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_state (user_id, state)
  VALUES (NEW.id, '{}'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_state ON auth.users;
CREATE TRIGGER on_auth_user_created_state
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_state();

REVOKE EXECUTE ON FUNCTION public.handle_new_user_state() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_user_state_updated_at() FROM PUBLIC, anon, authenticated;
