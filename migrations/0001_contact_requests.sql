-- Messages sent from the contact form on creatorsclub.co.in
CREATE TABLE IF NOT EXISTS contact_requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  role       TEXT    NOT NULL CHECK (role IN ('creator', 'brand', 'other')),
  message    TEXT    NOT NULL,
  country    TEXT,
  user_agent TEXT,
  handled    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created ON contact_requests (created_at DESC);
