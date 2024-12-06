class CreateWebhookTables < ActiveRecord::Migration[7.1]
  def change
    create_table :webhook_integrations, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :secret
      t.integer :provider, null: false, default: 0
      t.references :subject, polymorphic: true, null: false, unsigned: true
      t.references :organization, null: false, unsigned: true, index: true
      t.datetime :discarded_at, index: true

      t.timestamps
    end

    create_table :webhook_integration_events, id: { type: :bigint, unsigned: true } do |t|
      t.references :webhook_integration, null: false, unsigned: true
      t.text :payload, null: false, limit: 16.megabytes - 1
      t.string :event_name
      t.datetime :processed_at

      t.timestamps
    end

    add_reference :messages, :webhook_integration, unsigned: true
  end
end