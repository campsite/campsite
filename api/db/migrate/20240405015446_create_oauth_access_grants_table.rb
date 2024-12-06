class CreateOauthAccessGrantsTable < ActiveRecord::Migration[7.0]
  def change
    create_table :oauth_access_grants do |t|
      t.references :resource_owner,  null: false, polymorphic: true, index: true
      t.references :application,     null: false, index: true
      t.string   :token,             null: false
      t.integer  :expires_in,        null: false
      t.text     :redirect_uri,      null: false
      t.datetime :created_at,        null: false
      t.datetime :revoked_at
      t.string   :scopes,            null: false, default: ''
    end
  end
end
