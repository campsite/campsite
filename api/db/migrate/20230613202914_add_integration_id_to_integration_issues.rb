class AddIntegrationIdToIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    add_column :integration_issues, :integration_id, :bigint, unsigned: true
  end
end
