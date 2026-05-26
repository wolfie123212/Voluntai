-- Contentless FTS5 tables require the special 'delete' auxiliary command
-- instead of plain DELETE/UPDATE SQL. Fix both the au and ad triggers.

DROP TRIGGER IF EXISTS opp_au;
DROP TRIGGER IF EXISTS opp_ad;

CREATE TRIGGER opp_au AFTER UPDATE ON opportunities BEGIN
  -- Remove old index entry using FTS5 'delete' command
  INSERT INTO opportunities_fts(opportunities_fts, rowid, title, summary, description, categories, org_name)
  VALUES('delete', old.id, old.title, old.summary, old.description, old.categories,
         (SELECT name FROM organizations WHERE id = old.org_id));
  -- Add updated entry
  INSERT INTO opportunities_fts(rowid, title, summary, description, categories, org_name)
  SELECT new.id, new.title, new.summary, new.description, new.categories,
         (SELECT name FROM organizations WHERE id = new.org_id);
END;

CREATE TRIGGER opp_ad AFTER DELETE ON opportunities BEGIN
  INSERT INTO opportunities_fts(opportunities_fts, rowid, title, summary, description, categories, org_name)
  VALUES('delete', old.id, old.title, old.summary, old.description, old.categories,
         (SELECT name FROM organizations WHERE id = old.org_id));
END;
