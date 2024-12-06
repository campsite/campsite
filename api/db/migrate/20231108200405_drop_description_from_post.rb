class DropDescriptionFromPost < ActiveRecord::Migration[7.0]
  def change
    remove_column :posts, :description
    remove_column :posts, :previous_description
    remove_column :post_comments, :body
  end
end
