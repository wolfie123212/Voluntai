-- FTS5 virtual table for full-text search on opportunities
CREATE VIRTUAL TABLE IF NOT EXISTS opportunities_fts USING fts5(
  title,
  summary,
  description,
  categories,
  org_name,
  content='',
  tokenize='porter unicode61'
);

-- Keep FTS in sync with opportunities table
CREATE TRIGGER IF NOT EXISTS opp_ai AFTER INSERT ON opportunities BEGIN
  INSERT INTO opportunities_fts(rowid, title, summary, description, categories, org_name)
  SELECT new.id, new.title, new.summary, new.description, new.categories,
         (SELECT name FROM organizations WHERE id = new.org_id);
END;

CREATE TRIGGER IF NOT EXISTS opp_au AFTER UPDATE ON opportunities BEGIN
  UPDATE opportunities_fts SET
    title = new.title,
    summary = new.summary,
    description = new.description,
    categories = new.categories,
    org_name = (SELECT name FROM organizations WHERE id = new.org_id)
  WHERE rowid = new.id;
END;

CREATE TRIGGER IF NOT EXISTS opp_ad AFTER DELETE ON opportunities BEGIN
  DELETE FROM opportunities_fts WHERE rowid = old.id;
END;
