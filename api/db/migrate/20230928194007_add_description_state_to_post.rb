class AddDescriptionStateToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :description_state, :mediumtext
  end
end
