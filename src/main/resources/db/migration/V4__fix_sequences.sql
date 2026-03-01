-- Reset identity sequences so the next INSERT gets a new id (avoids "duplicate key (id)=(1)" when sequence was out of sync).
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 0) + 1);
SELECT setval(pg_get_serial_sequence('role', 'id'), COALESCE((SELECT MAX(id) FROM role), 0) + 1);
