class AddMetadataToIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    add_column :integration_issues, :metadata, :json
  end
end
