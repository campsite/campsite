class CreateOpenGraphLinks < ActiveRecord::Migration[7.0]
  def change
    create_table :open_graph_links do |t|
      t.text :url, null: false, unique: true
      t.text :title, null: false
      t.text :image_path

      t.timestamps
    end
  end
end
