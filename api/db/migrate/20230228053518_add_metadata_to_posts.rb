class AddMetadataToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :metadata, :json
  end
end