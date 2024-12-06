class MakeOauthApplicationRedirectUriNullable < ActiveRecord::Migration[7.2]
  def change
    change_column_null :oauth_applications, :redirect_uri, true
  end
end
