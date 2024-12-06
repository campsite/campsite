class CreateAttachments < ActiveRecord::Migration[7.0]
  def change
    create_table :attachments, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :file_path, null: false
      t.string :file_type, null: false
      t.references :subject, polymorphic: true, null: false, unsigned: true
      t.string :preview_file_path
      t.integer :width
      t.integer :height

      t.timestamps
    end
  end
end
