# Incidente Auth Supabase (500 unexpected_failure)

Fecha: 2026-02-23
Proyecto: `fbohyttqwztzairhebdc`
Severidad: bloqueante (no permite login)

## Síntoma
Al intentar iniciar sesión (password grant) en `unidadc-app`, Supabase Auth responde 500.

Mensaje mostrado en app:
- "El servicio de autenticación devolvió un error interno de base de datos..."

Respuesta API:
- `error_code`: `unexpected_failure`
- `msg`: `Database error querying schema`

## Evidencia técnica

### Endpoint token
`POST /auth/v1/token?grant_type=password`

- `sb-request-id`: `019c89d6-ce86-76aa-9f89-bc234d6a6b15`
- `error_id`: `9d25b5b7f48885db-QRO`

### Endpoint otp (control cruzado)
`POST /auth/v1/otp`

- `error_code`: `unexpected_failure`
- `msg`: `Database error finding user`
- `error_id`: `9d25b28d462b5638-QRO`

### Error IDs previos observados
- `9d25b194717ad9f7-QRO`
- `9d25b5b7f48885db-QRO`
- `9d25b28d462b5638-QRO`

## Acciones de mitigación ya ejecutadas
1. Validación de conectividad y credenciales (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`) OK.
2. Script de reparación de grants sobre schema `auth` ejecutado:
   - [unidadc-app/supabase/sql/controlcfdi/fix_auth_schema_integrity.sql](../../../../unidadc-app/supabase/sql/controlcfdi/fix_auth_schema_integrity.sql)
3. Verificación posterior del script:
   - `auth_users_count_after_fix = 1`
4. Prueba con SDK de Supabase en Node:
   - `signInWithPassword` sigue devolviendo `Database error querying schema`.

## Conclusión
La app cliente no es la causa. El error persiste aun con grants de `auth` reparados y pruebas directas contra Auth API, lo que sugiere drift interno de Auth/GoTrue o inconsistencia en esquema interno administrado.

## Solicitud a Soporte Supabase
Favor de revisar y corregir la integridad interna del servicio Auth del proyecto `fbohyttqwztzairhebdc`.

Adjuntar revisión de:
- migraciones internas de GoTrue/Auth
- permisos/roles internos usados por Auth
- salud de esquema `auth` y objetos dependientes

## Impacto
- Login bloqueado para todos los usuarios.
- Desarrollo funcional del backoffice detenido en flujos autenticados.
