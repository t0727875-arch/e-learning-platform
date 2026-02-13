CREATE INDEX IF NOT EXISTS idx_certificates_user
    ON certificates (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_code
    ON certificates (unique_code);
