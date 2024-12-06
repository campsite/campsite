class IncreaseTagNameCharacterLimit < ActiveRecord::Migration[7.0]
  def change
    change_column :tags, :name, :string, limit: 32, null: false, index: true
  end
end
