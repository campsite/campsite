class CreatePostComments < ActiveRecord::Migration[7.0]
  def change
    create_table :post_comments do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.text       :body, null: false
      t.references :user, null: false, unsigned: true
      t.references :post, null: false, unsigned: true, index: true
      t.references :post_file, unsigned: true
      t.timestamps
    end
  end
end
