ALTER TABLE classroom_members
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE classroom_members
  ALTER COLUMN role SET DEFAULT 'student';
