class ChangeUrlColumnsToText < ActiveRecord::Migration[7.0]
  def up
    change_column :post_link_previews, :url, :text, null: false
    change_column :post_links, :url, :text, null: false
  end

  def down
    change_column :post_link_previews, :url, :string, null: false
    change_column :post_links, :url, :string, null: false
  end
end
