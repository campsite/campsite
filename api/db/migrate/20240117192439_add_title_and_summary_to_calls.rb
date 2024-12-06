class AddTitleAndSummaryToCalls < ActiveRecord::Migration[7.1]
  def change
    add_column :calls, :title, :string
    add_column :calls, :summary, :text, size: :medium
  end
end
