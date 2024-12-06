class ChangeHtmlTextLimit < ActiveRecord::Migration[7.0]
  def up
    change_column :posts, :description_html, :mediumtext
    change_column :post_comments, :body_html, :mediumtext
  end

  def down
    change_column :posts, :description_html, :text
    change_column :post_comments, :body_html, :text
  end
end
