class AddVisibilityToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :visibility, :integer, null: false, default: 0
  end
end
