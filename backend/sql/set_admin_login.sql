INSERT INTO users (
  id,
  full_name,
  phone,
  email,
  password_hash,
  email_verified_at,
  last_login_at,
  created_at,
  updated_at
) VALUES (
  '7ba0d6d6-4b8b-44e4-8e59-5bd047f0114f',
  'Admin User',
  NULL,
  'admin@namastebharat.local',
  'scrypt$64$ae32df0f079046d706aeb1272493f0ae$3e8f7546bf027cea822a25a54fdcea9ef21a803c8b1acf299df9ff8cf784b015c2d5a1e26b61d38edf623acdd111c7d453ab997c16d17789ae9f432b32dcf0bd',
  NULL,
  NULL,
  '2026-03-26 18:00:00',
  '2026-03-26 18:00:00'
) ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO profiles (
  id,
  full_name,
  phone,
  role,
  created_at,
  updated_at
) VALUES (
  '7ba0d6d6-4b8b-44e4-8e59-5bd047f0114f',
  'Admin User',
  NULL,
  'admin',
  '2026-03-26 18:00:00',
  '2026-03-26 18:00:00'
) ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  role = VALUES(role),
  updated_at = CURRENT_TIMESTAMP;

UPDATE profiles
SET role = 'user',
    updated_at = CURRENT_TIMESTAMP
WHERE id = '3d4b1e39-ce51-4b00-b565-8696c3386214'
   OR id = (
     SELECT id
     FROM users
     WHERE email = 'acct1459790209@example.com'
     LIMIT 1
   );
