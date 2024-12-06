class AddHierarchiesColumnsToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :parent_id, :bigint, unsigned: true, index: true
    add_column :posts, :version, :integer, default: 1
  end
end
