# frozen_string_literal: true

class CreateIntegrationOrganizationMembershipData < ActiveRecord::Migration[7.0]
  def change
    create_table(:integration_organization_membership_data, id: { type: :bigint, unsigned: true }) do |t|
      t.bigint(:integration_organization_membership_id, unsigned: true, null: false)
      t.string("name", null: false)
      t.string("value", null: false)

      t.timestamps
    end
    add_index(:integration_organization_membership_data, :integration_organization_membership_id, name: "index_integration_org_member_data_on_integration_org_member")
  end
end
