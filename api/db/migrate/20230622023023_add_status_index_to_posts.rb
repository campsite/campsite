class AddStatusIndexToPosts < ActiveRecord::Migration[7.0]
  def change
    add_index :posts, :status
  end
end
