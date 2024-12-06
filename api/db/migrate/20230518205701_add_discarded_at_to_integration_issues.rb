class AddDiscardedAtToIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    add_column :integration_issues, :discarded_at, :datetime
  end
end
