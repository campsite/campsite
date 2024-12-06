class AddHtmlToPostsAndComments < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :description_html, :text
    add_column :post_comments, :body_html, :text
  end
end
