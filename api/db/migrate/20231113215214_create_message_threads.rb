class CreateMessageThreads < ActiveRecord::Migration[7.1]
  def change
    create_table :message_threads, id: { type: :bigint, unsigned: true } do |t|
      t.references :owner, null: false, unsigned: true
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :title, null: true
      t.datetime :last_message_at, null: true, index: true
      t.references :latest_message, unsigned: true

      t.timestamps
    end

    create_table :message_thread_memberships, id: { type: :bigint, unsigned: true } do |t|
      t.references :message_thread, null: false, unsigned: true
      t.references :organization_membership, null: false, unsigned: true
      t.datetime :last_read_at, null: true, index: true

      t.timestamps
    end

    add_index :message_thread_memberships, [:message_thread_id, :organization_membership_id], unique: true

    create_table :messages, id: { type: :bigint, unsigned: true } do |t|
      t.references :message_thread, null: false, unsigned: true
      t.references :sender, null: false, unsigned: true
      t.text :content, null: false
      t.string :public_id, limit: 12, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
