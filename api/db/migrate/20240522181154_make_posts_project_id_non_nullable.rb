class MakePostsProjectIdNonNullable < ActiveRecord::Migration[7.1]
  def up
    change_column :posts, :project_id, :bigint, unsigned: true, null: false
  end

  def down
    change_column :posts, :project_id, :bigint, unsigned: true
  end
end
