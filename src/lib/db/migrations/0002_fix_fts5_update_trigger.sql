-- Fix the opp_au trigger: contentless FTS5 tables don't support UPDATE.
-- Replace with DELETE + INSERT pattern.

DROP TRIGGER IF EXISTS opp_au;

CREATE TRIGGER opp_au AFTER UPDATE ON opportunities BEGIN
  DELETE FROM opportunities_fts WHERE rowid = old.id;
  INSERT INTO opportunities_fts(rowid, title, summary, description, categories, org_name)
  SELECT new.id, new.title, new.summary, new.description, new.categories,
         (SELECT name FROM organizations WHERE id = new.org_id);
END;
