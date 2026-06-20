
REVOKE EXECUTE ON FUNCTION public.handle_new_user_state() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_user_state_updated_at() FROM PUBLIC, anon, authenticated;
