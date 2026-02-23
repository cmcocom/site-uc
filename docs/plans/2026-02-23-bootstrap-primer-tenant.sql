-- BOOTSTRAP PRIMER TENANT + MEMBRESÍA DE USUARIO
-- Fecha: 2026-02-23
-- Requiere:
--   1) 2026-02-23-ddl-inicial-supabase-mvp.sql
--   2) 2026-02-23-rls-endurecimiento-roles.sql
--   3) 2026-02-23-seed-inicial-negocio.sql
--
-- Uso:
-- 1) Reemplaza los valores de variables en el bloque params.
--    - Obligatorio: usa v_target_user_id (tomado de auth.users.id).
-- 2) Ejecuta en Supabase SQL Editor.

begin;

do $$
declare
  v_org_name text := 'Unidad C';
  v_org_slug text := 'unidadc';
  v_target_user_id uuid := '14d25573-e0d9-4d25-8f74-cd4fb4fc8329'::uuid;
  v_target_role text := 'owner';

  v_org_id uuid;
  v_user_id uuid;
  v_role_id uuid;
begin
  -- 1) Organización
  insert into public.organizations (name, slug, status, timezone)
  values (v_org_name, v_org_slug, 'active', 'America/Mexico_City')
  on conflict (slug) do update
    set name = excluded.name,
        status = excluded.status,
        timezone = excluded.timezone,
        updated_at = now()
  returning id into v_org_id;

  -- 2) Usuario en auth.users (prerrequisito estricto por user_id)
  if v_target_user_id is null then
    raise exception 'v_target_user_id es obligatorio. Obténlo con: select id, email from auth.users order by created_at desc;';
  end if;

  select u.id into v_user_id
  from auth.users u
  where u.id = v_target_user_id
  limit 1;

  if v_user_id is null then
    raise exception 'No existe usuario en auth.users para user_id=%. Crea/invita el usuario primero en Supabase Auth y vuelve a ejecutar. Diagnóstico: select id, email from auth.users order by created_at desc limit 20;', v_target_user_id;
  end if;

  -- 3) Rol
  select r.id into v_role_id
  from public.roles r
  where r.key = v_target_role
  limit 1;

  if v_role_id is null then
    raise exception 'No existe el rol: %. Ejecuta primero el script de endurecimiento RLS.', v_target_role;
  end if;

  -- 4) Profile
  insert into public.users_profile (id, email, full_name, status)
  select u.id, u.email, null, 'active'
  from auth.users u
  where u.id = v_user_id
  on conflict (id) do update
    set email = excluded.email,
        status = 'active',
        updated_at = now();

  -- 5) Membership
  insert into public.organization_members (
    organization_id,
    user_id,
    role_id,
    status,
    joined_at
  )
  values (
    v_org_id,
    v_user_id,
    v_role_id,
    'active',
    now()
  )
  on conflict (organization_id, user_id) do update
  set role_id = excluded.role_id,
      status = 'active',
      joined_at = coalesce(public.organization_members.joined_at, excluded.joined_at),
      updated_at = now();

  raise notice 'Bootstrap OK. org_id=%, user_id=%, role_id=%', v_org_id, v_user_id, v_role_id;
end $$;

commit;

-- Verificaciones sugeridas:
-- 1) select id, name, slug from public.organizations order by created_at desc;
-- 2) select * from public.organization_members order by created_at desc;
-- 3) select id, email, status from public.users_profile order by created_at desc;
