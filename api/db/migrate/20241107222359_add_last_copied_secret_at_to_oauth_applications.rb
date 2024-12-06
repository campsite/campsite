class AddLastCopiedSecretAtToOauthApplications < ActiveRecord::Migration[7.2]
  def change
    add_column :oauth_applications, :last_copied_secret_at, :datetime
  end
end
