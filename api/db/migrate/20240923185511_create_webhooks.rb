class CreateWebhooks < ActiveRecord::Migration[7.2]
  def change
    create_table :webhooks, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :url, null: false
      t.integer :state, default: 0, null: false
      t.datetime :discarded_at
      t.references :owner, polymorphic: true, null: false, unsigned: true
      t.bigint :creator_id, unsigned: true, null: false
      t.string :secret, null: false

      t.timestamps
    end

    create_table :webhook_events, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :event_type, null: false
      t.json :payload, null: false
      t.string :signature, null: false
      t.integer :status, default: 0, null: false
      t.references :webhook, null: false, unsigned: true, index: true
      t.integer :deliveries_count, default: 0, null: false

      t.timestamps
    end

    create_table :webhook_deliveries, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.integer :status_code
      t.datetime :delivered_at
      t.references :webhook_event, null: false, unsigned: true, index: true

      t.timestamps
    end

    add_index :webhook_events, [:event_type, :webhook_id]
    add_index :webhook_events, [:status, :webhook_id]
  end
end