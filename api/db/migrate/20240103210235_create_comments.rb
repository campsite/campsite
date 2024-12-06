class CreateComments < ActiveRecord::Migration[7.1]
  def change
    create_table :comments, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }

      t.references :organization_membership, null: false, unsigned: true, index: true
      t.references :subject, polymorphic: true, null: false, unsigned: true, index: true
      t.references :parent, unsigned: true, index: true
      t.references :attachment, unsigned: true, index: true
      t.references :resolved_by, unsigned: true, index: true

      t.mediumtext :body_html
      t.datetime :resolved_at, index: true
      t.integer :timestamp
      t.float :x
      t.float :y
      t.text :note_highlight
      t.string :remote_comment_id
      t.datetime :remote_comment_synced_at
      t.string :remote_user_id
      t.string :remote_user_name
      t.integer :remote_service
      t.integer :origin, default: 0, null: false
      
      t.datetime :discarded_at, index: true
      t.timestamps
    end
  end
end
