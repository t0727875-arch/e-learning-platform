CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom
    ON classroom_members (classroom_id);

CREATE INDEX IF NOT EXISTS idx_classroom_members_user
    ON classroom_members (user_id);
