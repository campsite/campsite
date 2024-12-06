class AddWorkosColumns < ActiveRecord::Migration[7.0]
  def change
    add_column :organizations, :workos_organization_id, :string
    add_index :organizations, :workos_organization_id

    add_column :users, :workos_profile_id, :string
    add_index :users, :workos_profile_id
  end
end
