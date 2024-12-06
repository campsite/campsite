class AddRefreshTokenToIntegrations < ActiveRecord::Migration[7.0]
  def change
    add_column :integrations, :refresh_token, :string
    add_column :integrations, :token_expires_at, :datetime
  end
end
