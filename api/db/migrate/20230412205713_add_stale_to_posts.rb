class AddStaleToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :stale, :boolean, default: false, null: false, index: true
  end
end
