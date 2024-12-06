class CreateMessageNotifications < ActiveRecord::Migration[7.2]
  def change
    create_table :message_notifications, id: { type: :bigint, unsigned: true } do |t|
      t.timestamps
      t.references :message_thread_membership, unsigned: true
      t.references :message, unsigned: true
    end

    add_index :message_notifications, [:message_thread_membership_id, :message_id], unique: true
  end
end
