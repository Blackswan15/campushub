USE campushub;

-- 1. Create sub_events table
CREATE TABLE IF NOT EXISTS sub_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  type ENUM('technical','non-technical','general') NOT NULL DEFAULT 'general',
  capacity INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 2. Add sub_event_id column (safe: check first via procedure)
DROP PROCEDURE IF EXISTS add_col_if_missing;
DELIMITER //
CREATE PROCEDURE add_col_if_missing()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'campushub'
      AND TABLE_NAME   = 'registrations'
      AND COLUMN_NAME  = 'sub_event_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN sub_event_id INT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'campushub'
      AND TABLE_NAME = 'registrations'
      AND CONSTRAINT_NAME = 'fk_reg_subevent'
  ) THEN
    ALTER TABLE registrations
      ADD CONSTRAINT fk_reg_subevent
      FOREIGN KEY (sub_event_id) REFERENCES sub_events(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'campushub'
      AND TABLE_NAME = 'registrations'
      AND CONSTRAINT_NAME = 'unique_sub_reg'
  ) THEN
    ALTER TABLE registrations
      ADD UNIQUE KEY unique_sub_reg (user_id, sub_event_id);
  END IF;
END //
DELIMITER ;

CALL add_col_if_missing();
DROP PROCEDURE IF EXISTS add_col_if_missing;

-- 3. For every existing event without sub_events, auto-create a 'Main Event' sub-event (backward compat)
INSERT INTO sub_events (event_id, name, type, capacity)
SELECT e.id, 'Main Event', 'general', e.capacity
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM sub_events s WHERE s.event_id = e.id);

-- 4. For existing registrations with no sub_event_id, link to the matching Main Event sub-event
UPDATE registrations r
JOIN sub_events s ON s.event_id = r.event_id AND s.name = 'Main Event'
SET r.sub_event_id = s.id
WHERE r.sub_event_id IS NULL;

SELECT 'Migration complete!' AS status;
