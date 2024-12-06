class AddOrganizationSsoDomains < ActiveRecord::Migration[7.0]
  def change
    create_table :organization_sso_domains, id: { type: :bigint, unsigned: true } do |t|
      t.string :domain, null: false, index: true
      t.references :organization, null: false, unsigned: true

      t.timestamps
    end
  end
end
