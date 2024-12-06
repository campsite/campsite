class AddLoginTokenSsoIdToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :login_token_sso_id, :string
  end
end
