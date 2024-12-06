class CreateDataExport < ActiveRecord::Migration[7.2]
  def change
    create_table :data_exports, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.references :subject, polymorphic: true, null: false, unsigned: true, index: true
      t.references :member, unsigned: true, index: true
      t.string :zip_path, limit: 2048
      t.datetime :completed_at
      t.timestamps
    end

    create_table :data_export_resources, id: { type: :bigint, unsigned: true } do |t|
      t.references :data_export, null: false, unsigned: true, index: true
      t.integer :resource_id, null: true
      t.integer :resource_type, null: false
      t.integer :status, null: false, default: 0
      t.datetime :completed_at
      t.timestamps
    end
  end
end
