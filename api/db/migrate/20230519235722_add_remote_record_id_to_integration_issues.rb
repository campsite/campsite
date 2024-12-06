class AddRemoteRecordIdToIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    add_column :integration_issues, :remote_record_id, :string
  end
end
