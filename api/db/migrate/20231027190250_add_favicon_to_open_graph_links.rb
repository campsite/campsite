class AddFaviconToOpenGraphLinks < ActiveRecord::Migration[7.0]
  def change
    add_column :open_graph_links, :favicon_path, :string
  end
end
