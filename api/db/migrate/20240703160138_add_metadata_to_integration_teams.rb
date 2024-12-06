class AddMetadataToIntegrationTeams < ActiveRecord::Migration[7.1]
  def up
    add_column :integration_teams, :metadata, :json
  end

  def down
    remove_column :integration_teams, :metadata
  end
end
