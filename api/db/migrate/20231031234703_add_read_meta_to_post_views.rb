class AddReadMetaToPostViews < ActiveRecord::Migration[7.0]
  def change
    add_column :post_views, :dwell_time_total, :integer, default: 0, null: false
    add_column :post_views, :reads_count, :integer, default: 0, null: false
  end
end
