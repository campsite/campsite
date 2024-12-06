class DropPostFiles < ActiveRecord::Migration[7.0]
  def change
    drop_table :post_files
    drop_table :organization_stats
  end
end
