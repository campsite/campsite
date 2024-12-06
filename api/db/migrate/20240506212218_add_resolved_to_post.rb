class AddResolvedToPost < ActiveRecord::Migration[7.1]
  def change
    add_column :posts, :resolved_at, :datetime
    add_column :posts, :resolved_by_id, :bigint, unsigned: true
    add_column :posts, :resolved_html, :mediumtext

    add_index :posts, :resolved_at
    add_index :posts, :resolved_by_id
  end
end
