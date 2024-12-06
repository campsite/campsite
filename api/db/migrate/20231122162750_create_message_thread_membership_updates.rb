class CreateMessageThreadMembershipUpdates < ActiveRecord::Migration[7.1]
  def change
    create_table :message_thread_membership_updates, id: { type: :bigint, unsigned: true } do |t|
      t.references :message_thread, null: false, unsigned: true
      t.references :actor, null: false, unsigned: true
      t.json :added_organization_membership_ids
      t.json :removed_organization_membership_ids
      t.datetime :discarded_at, index: true

      t.timestamps
    end
  end
end
