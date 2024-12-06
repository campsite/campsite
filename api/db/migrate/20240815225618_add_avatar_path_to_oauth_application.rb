class AddAvatarPathToOauthApplication < ActiveRecord::Migration[7.2]
  def change
    add_column :oauth_applications, :avatar_path, :string
  end
end
