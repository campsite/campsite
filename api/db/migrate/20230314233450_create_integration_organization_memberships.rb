# frozen_string_literal: true

class CreateIntegrationOrganizationMemberships < ActiveRecord::Migration[7.0]
  def change
    create_table(:integration_organization_memberships, id: { type: :bigint, unsigned: true }) do |t|
      t.bigint(:integration_id, unsigned: true, null: false)
      t.bigint(:organization_membership_id, unsigned: true, null: false)

      t.timestamps
    end
    add_index(:integration_organization_memberships, :integration_id)
    add_index(:integration_organization_memberships, :organization_membership_id, name: "index_integration_org_members_on_member")
    add_index(:integration_organization_memberships, [:integration_id, :organization_membership_id], unique: true, name: "index_integration_org_members_on_integration_and_member")
  end
end
