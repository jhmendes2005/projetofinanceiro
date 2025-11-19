-- Function to process recurring transactions
CREATE OR REPLACE FUNCTION process_recurring_transactions(p_user_id UUID)
RETURNS void AS $$
DECLARE
  r RECORD;
  next_date DATE;
BEGIN
  FOR r IN
    SELECT * FROM recurring_transactions
    WHERE user_id = p_user_id
      AND is_active = true
      AND auto_create = true
      AND next_occurrence <= CURRENT_DATE
  LOOP
    -- Loop to catch up on all missed occurrences
    WHILE r.next_occurrence <= CURRENT_DATE LOOP
      -- Insert transaction
      INSERT INTO transactions (
        user_id, account_id, category_id, type, amount, description, date, status, is_recurring, recurring_id
      ) VALUES (
        r.user_id, r.account_id, r.category_id, r.type, r.amount, r.description, r.next_occurrence, 'completed', true, r.id
      );

      -- Calculate next occurrence
      CASE r.frequency
        WHEN 'daily' THEN next_date := r.next_occurrence + INTERVAL '1 day';
        WHEN 'weekly' THEN next_date := r.next_occurrence + INTERVAL '1 week';
        WHEN 'biweekly' THEN next_date := r.next_occurrence + INTERVAL '2 weeks';
        WHEN 'monthly' THEN next_date := r.next_occurrence + INTERVAL '1 month';
        WHEN 'quarterly' THEN next_date := r.next_occurrence + INTERVAL '3 months';
        WHEN 'yearly' THEN next_date := r.next_occurrence + INTERVAL '1 year';
      END CASE;
      
      -- Update local variable for the loop
      r.next_occurrence := next_date;
      
      -- Check end date
      IF r.end_date IS NOT NULL AND r.next_occurrence > r.end_date THEN
        UPDATE recurring_transactions SET is_active = false WHERE id = r.id;
        EXIT; -- Exit the while loop
      END IF;
    END LOOP;

    -- Update the actual table with the final next_occurrence
    UPDATE recurring_transactions
    SET next_occurrence = r.next_occurrence,
        updated_at = NOW()
    WHERE id = r.id;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;
