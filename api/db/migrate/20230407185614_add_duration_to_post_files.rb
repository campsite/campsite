class AddDurationToPostFiles < ActiveRecord::Migration[7.0]
  def change
    add_column :post_files, :duration, :integer
  end
end
