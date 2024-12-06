class AddPostTagsToPosts < ActiveRecord::Migration[7.0]
  def change
    create_table :tags do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :name, limit: 16, null: false, index: true
      t.references :organization, null: false, unsigned: true, index: true
      t.timestamps
    end

    add_index :tags, [:organization_id, :name], unique: true

    create_table :post_taggings do |t|
      t.references :tag
      t.references :post
      t.timestamps
    end

    add_index :post_taggings, [:post_id, :tag_id], unique: true
  end
end
