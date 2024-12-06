class AddPostIdToIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    add_column :integration_issues, :post_id, :bigint, unsigned: true
    add_index :integration_issues, :post_id
  end
end
