class CreateNotifications < ActiveRecord::Migration[7.0]
  def change
    create_table :notifications, id: { type: :bigint, unsigned: true }  do |t|
      t.references :organization_membership, null: false, unsigned: true
      t.references :event, null: false, unsigned: true
      t.datetime :deleted_at
      t.datetime :read_at
      t.integer :reason, null: false

      t.timestamps
    end
  end
end
