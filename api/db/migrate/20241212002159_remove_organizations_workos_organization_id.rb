class RemoveOrganizationsWorkosOrganizationId < ActiveRecord::Migration[7.2]
  def change
    remove_column :organizations, :workos_organization_id, :string
  end
end
