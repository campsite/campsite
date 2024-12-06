class AddPreviousTokenToOauthAccessTokens < ActiveRecord::Migration[7.0]
  def change
    add_column :oauth_access_tokens, :previous_token, :string
  end
end
