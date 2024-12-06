class AddPublicIdToIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    add_column :integration_issues, :public_id, :string, limit: 12
  end
end
