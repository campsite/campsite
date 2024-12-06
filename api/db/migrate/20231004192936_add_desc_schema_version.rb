class AddDescSchemaVersion < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :description_schema_version, :integer, default: 0, null: false
  end
end
