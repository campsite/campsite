class DropOrganizationSsoDomains < ActiveRecord::Migration[7.2]
  def change
    drop_table :organization_sso_domains, id: { type: :bigint, unsigned: true } do |t|
      t.string "domain", null: false
      t.bigint "organization_id", null: false, unsigned: true
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["domain"], name: "index_organization_sso_domains_on_domain"
      t.index ["organization_id"], name: "index_organization_sso_domains_on_organization_id" 
    end
  end
end
