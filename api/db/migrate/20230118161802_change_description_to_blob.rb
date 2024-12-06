class ChangeDescriptionToBlob < ActiveRecord::Migration[7.0]
  def change
    change_column :feedbacks, :description, :text, null: false
  end
end
