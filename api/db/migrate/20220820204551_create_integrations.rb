class CreateIntegrations < ActiveRecord::Migration[7.0]
  def change
    create_table :integrations, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :provider, null: false, index: true
      t.string     :token, null: false
      t.references :creator, null: false, unsigned: true
      t.references :organization, null: false, unsigned: true
      t.timestamps
    end

    create_table :integration_data, id: { type: :bigint, unsigned: true } do |t|
      t.string :name, null: false
      t.string :value, null: false
      t.references :integration, null: false, unsigned: true
      t.timestamps
    end
  end
end
