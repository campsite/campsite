class CreateBookmarks < ActiveRecord::Migration[7.0]
  def change
    create_table :bookmarks, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :title, null: false
      t.text       :url, null: false
      t.integer    :position, default: 0, index: true
      t.references :bookmarkable, polymorphic: true, null: false, unsigned: true
      t.timestamps
    end
  end
end
