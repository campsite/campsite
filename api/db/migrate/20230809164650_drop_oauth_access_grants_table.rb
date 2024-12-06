class DropOauthAccessGrantsTable < ActiveRecord::Migration[7.0]
  def change
    drop_table :oauth_access_grants do |t|
      t.bigint "resource_owner_id", null: false
      t.bigint "application_id", null: false
      t.string "token", null: false
      t.integer "expires_in", null: false
      t.text "redirect_uri", null: false
      t.datetime "created_at", null: false
      t.datetime "revoked_at"
      t.string "scopes", default: "", null: false
      t.index ["application_id"], name: "index_oauth_access_grants_on_application_id"
      t.index ["resource_owner_id"], name: "index_oauth_access_grants_on_resource_owner_id"
      t.index ["token"], name: "index_oauth_access_grants_on_token", unique: true
    end
  end
end
