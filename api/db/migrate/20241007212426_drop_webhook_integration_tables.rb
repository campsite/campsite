class DropWebhookIntegrationTables < ActiveRecord::Migration[7.2]
  def change
    remove_column :posts, :webhook_integration_id, :bigint
    remove_column :messages, :webhook_integration_id, :bigint

    drop_table :webhook_integration_events do |t|
      t.bigint :webhook_integration_id, null: false, unsigned: true
      t.text :payload, size: :medium, null: false
      t.string :event_name
      t.datetime :processed_at
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
      t.index :webhook_integration_id
    end

    drop_table :webhook_integrations do |t|
      t.string :public_id, limit: 12, null: false
      t.string :secret
      t.integer :provider, default: 0, null: false
      t.string :subject_type, null: false
      t.bigint :subject_id, null: false, unsigned: true
      t.bigint :organization_id, null: false, unsigned: true
      t.datetime :discarded_at
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end
  end
end
