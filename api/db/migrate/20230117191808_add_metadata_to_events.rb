class AddMetadataToEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :metadata, :json
  end
end
