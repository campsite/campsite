class AddGeneratedTitleToCalls < ActiveRecord::Migration[7.1]
  def change
    add_column :calls, :generated_title, :string
    add_column :calls, :generated_title_status, :integer, default: 0, null: false
  end
end
