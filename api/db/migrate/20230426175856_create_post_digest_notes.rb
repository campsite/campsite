class CreatePostDigestNotes < ActiveRecord::Migration[7.0]
  def change
    create_table :post_digest_notes, id: { type: :bigint, unsigned: true } do |t|
      t.string(:public_id, limit: 12, null: false, index: { unique: true })
      t.text :title, null: false
      t.text :content, null: true
      t.references :organization_membership, null: false, unsigned: true
      t.references :post, null: false, unsigned: true
      t.references :post_digest, null: false, unsigned: true
      t.datetime :discarded_at, null: true
      t.timestamps
    end

    add_index :post_digest_notes, [:post_id, :post_digest_id]
  end
end
