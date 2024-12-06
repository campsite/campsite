class AddPostedToServiceAtToIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    add_column :integration_issues, :posted_to_service_at, :datetime
  end
end
