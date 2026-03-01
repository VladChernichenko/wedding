SELECT setval(pg_get_serial_sequence('child', 'id'), COALESCE((SELECT MAX(id) FROM child), 0) + 1);
