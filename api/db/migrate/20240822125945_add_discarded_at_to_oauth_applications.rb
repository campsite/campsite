class AddDiscardedAtToOauthApplications < ActiveRecord::Migration[7.2]
  def change
    add_column :oauth_applications, :discarded_at, :datetime
    add_index :oauth_applications, :discarded_at
  end
end
