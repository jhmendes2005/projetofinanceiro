-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Insert default expense categories
  INSERT INTO public.categories (user_id, name, type, color, icon, is_system) VALUES
    (NEW.id, 'Groceries', 'expense', '#10B981', '🛒', TRUE),
    (NEW.id, 'Dining Out', 'expense', '#F59E0B', '🍽️', TRUE),
    (NEW.id, 'Transportation', 'expense', '#3B82F6', '🚗', TRUE),
    (NEW.id, 'Utilities', 'expense', '#8B5CF6', '💡', TRUE),
    (NEW.id, 'Housing', 'expense', '#EF4444', '🏠', TRUE),
    (NEW.id, 'Healthcare', 'expense', '#EC4899', '⚕️', TRUE),
    (NEW.id, 'Entertainment', 'expense', '#F97316', '🎬', TRUE),
    (NEW.id, 'Shopping', 'expense', '#06B6D4', '🛍️', TRUE),
    (NEW.id, 'Education', 'expense', '#6366F1', '📚', TRUE),
    (NEW.id, 'Insurance', 'expense', '#14B8A6', '🛡️', TRUE),
    (NEW.id, 'Subscriptions', 'expense', '#A855F7', '📱', TRUE),
    (NEW.id, 'Personal Care', 'expense', '#EC4899', '💆', TRUE),
    (NEW.id, 'Gifts', 'expense', '#F43F5E', '🎁', TRUE),
    (NEW.id, 'Travel', 'expense', '#0EA5E9', '✈️', TRUE),
    (NEW.id, 'Other Expenses', 'expense', '#6B7280', '📝', TRUE);

  -- Insert default income categories
  INSERT INTO public.categories (user_id, name, type, color, icon, is_system) VALUES
    (NEW.id, 'Salary', 'income', '#10B981', '💰', TRUE),
    (NEW.id, 'Freelance', 'income', '#3B82F6', '💼', TRUE),
    (NEW.id, 'Investments', 'income', '#8B5CF6', '📈', TRUE),
    (NEW.id, 'Rental Income', 'income', '#F59E0B', '🏘️', TRUE),
    (NEW.id, 'Business', 'income', '#06B6D4', '🏢', TRUE),
    (NEW.id, 'Gifts Received', 'income', '#EC4899', '🎁', TRUE),
    (NEW.id, 'Refunds', 'income', '#14B8A6', '↩️', TRUE),
    (NEW.id, 'Other Income', 'income', '#6B7280', '💵', TRUE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON credit_cards;
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_card_transactions_updated_at ON credit_card_transactions;
CREATE TRIGGER update_credit_card_transactions_updated_at BEFORE UPDATE ON credit_card_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_transactions_updated_at ON recurring_transactions;
CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON financial_goals;
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update account balance after transaction
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Revert old transaction
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
    -- Apply new transaction
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_account_balance ON transactions;
CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Function to update credit card balance
CREATE OR REPLACE FUNCTION update_credit_card_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE credit_cards SET current_balance = current_balance + NEW.amount WHERE id = NEW.card_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE credit_cards SET current_balance = current_balance - OLD.amount + NEW.amount WHERE id = NEW.card_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE credit_cards SET current_balance = current_balance - OLD.amount WHERE id = OLD.card_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_credit_card_balance ON credit_card_transactions;
CREATE TRIGGER trigger_update_credit_card_balance
  AFTER INSERT OR UPDATE OR DELETE ON credit_card_transactions
  FOR EACH ROW EXECUTE FUNCTION update_credit_card_balance();

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'expense' AND NEW.category_id IS NOT NULL THEN
    UPDATE budgets 
    SET spent = (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions
      WHERE category_id = NEW.category_id
        AND type = 'expense'
        AND date >= budgets.start_date
        AND (budgets.end_date IS NULL OR date <= budgets.end_date)
    )
    WHERE category_id = NEW.category_id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_budget_spent ON transactions;
CREATE TRIGGER trigger_update_budget_spent
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent();
