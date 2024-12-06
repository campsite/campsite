class ChangeOpenGraphLinksFaviconPathToText < ActiveRecord::Migration[7.1]
  def up
    change_column :open_graph_links, :favicon_path, :text
  end

  def down
    change_column :open_graph_links, :favicon_path, :string
  end
end
