class CreateNotes < ActiveRecord::Migration[7.1]
  def change
    create_table :notes, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.integer :comments_count, default: 0, null: false, unsigned: true
      t.datetime :discarded_at, index: true
      t.references :organization_membership, null: false, unsigned: true, index: true
      t.mediumtext :description_html
      t.mediumtext :description_state
      t.integer :description_schema_version, default: 0, null: false
      t.text :title

      t.timestamps
    end
  end
end
