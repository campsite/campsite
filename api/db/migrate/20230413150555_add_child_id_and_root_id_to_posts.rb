class AddChildIdAndRootIdToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :child_id, :bigint, unsigned: true
    add_column :posts, :root_id, :bigint, unsigned: true

    add_index :posts, :child_id
    add_index :posts, :root_id
  end
end
