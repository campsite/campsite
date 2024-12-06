class AddProviderToOauthApplications < ActiveRecord::Migration[7.2]
  def change
    add_column :oauth_applications, :provider, :integer
  end
end
