class CreateOrganizationMembershipStatuses < ActiveRecord::Migration[7.1]
  def change
    create_table :organization_membership_statuses, id: { type: :bigint, unsigned: true } do |t|
      t.string :message, null: false
      t.string :emoji, null: false
      t.datetime :expires_at, null: true
      t.references :organization_membership, null: false, unsigned: true

      t.timestamps

      t.index :expires_at
    end

    add_column :organization_memberships, :latest_status_id, :bigint
  end
end
