class AddStatusToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :status, :integer, default: 0, null: false
  end
end
