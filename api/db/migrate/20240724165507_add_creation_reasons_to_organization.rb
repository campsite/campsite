class AddCreationReasonsToOrganization < ActiveRecord::Migration[7.1]
  def change
    add_column :organizations, :creator_role, :string
    add_column :organizations, :creator_org_size, :string
  end
end
